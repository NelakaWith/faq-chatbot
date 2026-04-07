const Fuse = require("fuse.js");
const dataService = require("./dataService");
const { formatPDFResponse } = require("../utils/formatters");
const { pool } = require("../db");
const { generateEmbedding, preloadEmbeddingPipeline } = require("../utils/embeddings");

class SearchService {
  constructor() {
    this.faqFuse = null;
    this.legalFuse = null;
    this.miscFuse = null;
    this.pdfFuse = null;
    this.allDataFuse = null;
    this.initialized = false;
    this.initializationPromise = null;
  }

  /**
   * Perform a hybrid search on the Neon database (Vector + Full-Text Search)
   * @param {string} query - The search query
   * @returns {Promise<Array>} - Search results
   */
  async searchLegalDatabase(query) {
    try {
      console.log(`🔎 Hybrid Search on Neon: "${query}"`);
      
      // 1. Generate query embedding
      const queryEmbedding = await generateEmbedding(query);
      
      // 2. Perform Hybrid Search using SQL
      // Combining Vector Similarity (Cosine) and Full-Text Search (Websearch)
      // We use a simple RRF-like or weighted approach here
      const sql = `
        WITH vector_search AS (
          SELECT id, content, metadata, 1 - (embedding <=> $1::vector) as similarity
          FROM documents
          ORDER BY embedding <=> $1::vector
          LIMIT 10
        ),
        fts_search AS (
          SELECT id, content, metadata, ts_rank_cd(fts_tokens, websearch_to_tsquery('english', $2)) as rank
          FROM documents
          WHERE fts_tokens @@ websearch_to_tsquery('english', $2)
          LIMIT 10
        )
        SELECT 
          COALESCE(v.id, f.id) as id,
          COALESCE(v.content, f.content) as content,
          COALESCE(v.metadata, f.metadata) as metadata,
          COALESCE(v.similarity, 0) as similarity,
          COALESCE(f.rank, 0) as rank,
          (COALESCE(v.similarity, 0) * 0.7 + COALESCE(f.rank, 0) * 0.3) as combined_score
        FROM vector_search v
        FULL OUTER JOIN fts_search f ON v.id = f.id
        ORDER BY combined_score DESC
        LIMIT 5;
      `;

      const { rows } = await pool.query(sql, [JSON.stringify(queryEmbedding), query]);
      
      console.log(`✅ Found ${rows.length} relevant legal chunks in Neon`);
      
      return rows.map(row => ({
        id: row.id,
        content: row.content,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        score: row.combined_score,
        type: 'pdf_chunk'
      }));
    } catch (err) {
      console.error('❌ Neon search error:', err);
      return []; // Fallback to empty if DB search fails
    }
  }

  async initialize() {
    // If already initialized, return immediately
    if (this.initialized) return;

    // If initialization is in progress, wait for it to complete
    if (this.initializationPromise) {
      console.log("⏳ Waiting for ongoing initialization...");
      return this.initializationPromise;
    }

    // Start initialization and store the promise
    this.initializationPromise = this._doInitialize();

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  async _doInitialize() {
    console.log("🔍 Initializing search service...");

    // Load all data
    await dataService.loadAllData();
    
    // Preload embedding model (crucial for 1GB Droplet)
    await preloadEmbeddingPipeline();

    // Create Fuse instances
    this.createFuseInstances();

    this.initialized = true;
    console.log("✅ Search service initialized");
  }

  /**
   * Update search indices without reloading data
   * Use this when data has been added to dataService directly
   */
  updateSearchIndices() {
    console.log("🔄 Updating search indices...");
    this.createFuseInstances();
    console.log("✅ Search indices updated");
  }

  createFuseInstances() {
    const { faqData, legalData, miscData, allSearchableData } =
      dataService.getData();

    // FAQ search
    this.faqFuse = new Fuse(faqData, {
      keys: ["question"],
      threshold: 0.6,
      includeScore: true,
      findAllMatches: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
      includeMatches: true,
      distance: 50,
      ignoreLocation: true,
    });

    // Legal search
    this.legalFuse = new Fuse(legalData, {
      keys: ["title", "content"],
      threshold: 0.4,
      includeScore: true,
      findAllMatches: true,
      useExtendedSearch: true,
      minMatchCharLength: 2,
      includeMatches: true,
      distance: 50,
      ignoreLocation: true,
    });

    // Misc/greetings search
    if (miscData && miscData.length > 0) {
      this.miscFuse = new Fuse(miscData, {
        keys: ["question"],
        threshold: 0.2,
        includeScore: true,
        findAllMatches: true,
        useExtendedSearch: true,
        minMatchCharLength: 1,
        includeMatches: true,
        distance: 20,
        ignoreLocation: true,
      });
    }

    // PDF search
    const pdfChunks = allSearchableData.filter(
      (item) => item.type === "pdf_chunk",
    );
    if (pdfChunks.length > 0) {
      this.pdfFuse = new Fuse(pdfChunks, {
        keys: ["title", "content"],
        threshold: 0.6,
        includeScore: true,
        findAllMatches: true,
        useExtendedSearch: true,
        minMatchCharLength: 3,
        includeMatches: true,
        distance: 80,
        ignoreLocation: true,
      });
    }

    console.log("🔍 Fuse search instances created");
  }

  // Define search strategies configuration
  getSearchStrategies() {
    return [
      {
        name: "payment",
        priority: 3,
        emoji: "💳",
        keywords: [
          "payment method",
          "pay with",
          "paying with",
          "online payment",
          "digital payment",
          "electronic payment",
          "how to pay",
          "payment options",
          "payment accepted",
          "fee payment",
          "billing",
          "invoice",
          "credit card",
          "debit card",
          "paypal",
          "bank transfer",
        ],
        searchTerms: ["payment", "billing", "invoice", "credit card"],
        source: "FAQ Database - Payment Methods",
      },
      {
        name: "pricing",
        priority: 4,
        emoji: "💰",
        keywords: [
          "cost",
          "price",
          "pricing",
          "much",
          "fee",
          "charge",
          "rate",
          "expensive",
        ],
        searchTerms: ["pricing", "cost", "fee"],
        source: "FAQ Database - Pricing",
      },
      {
        name: "legal",
        priority: 5,
        emoji: "⚖️",
        keywords: [
          "terms",
          "policy",
          "policies",
          "privacy",
          "data protection",
          "legal",
          "liability",
          "cancel",
          "cancellation",
          "warranty",
          "warranties",
          "dispute",
          "arbitration",
          "intellectual property",
          "copyright",
          "refund",
          "confidential",
          "confidentiality",
          "agreement",
          "contract",
          "compliance",
          "violation",
          "breach",
          "terms of service",
          "user agreement",
          "acceptable use",
          "code of conduct",
        ],
        searchType: "legal",
        source: "Legal Database",
      },
      {
        name: "account",
        priority: 6,
        emoji: "🎯",
        keywords: [
          "account",
          "profile",
          "subscription",
          "service",
          "membership",
        ],
        searchTerms: ["account", "profile", "subscription", "service"],
        source: "FAQ Database - Account",
      },
      {
        name: "support",
        priority: 7,
        emoji: "🎯",
        keywords: ["help", "support", "tutorial", "guide", "how to"],
        searchTerms: ["help", "support", "how"],
        source: "FAQ Database - Support",
      },
      {
        name: "security",
        priority: 8,
        emoji: "🎯",
        keywords: ["security", "protection", "safety", "secure"],
        searchTerms: ["security", "protection"],
        source: "FAQ Database - Security",
      },
      {
        name: "billing",
        priority: 9,
        emoji: "🎯",
        keywords: ["billing", "transaction", "payment", "invoice"],
        searchTerms: ["billing", "payment"],
        source: "FAQ Database - Billing",
      },
      {
        name: "features",
        priority: 10,
        emoji: "🎯",
        keywords: ["feature", "service", "function", "capability"],
        searchTerms: ["feature", "service"],
        source: "FAQ Database - Features",
      },
      {
        name: "terms",
        priority: 11,
        emoji: "🎯",
        keywords: ["terms", "conditions", "agreement", "policy"],
        searchTerms: ["terms", "policy"],
        source: "FAQ Database - Terms",
      },
      {
        name: "updates",
        priority: 12,
        emoji: "🎯",
        keywords: ["update", "new", "release", "date", "version"],
        searchTerms: ["update", "new", "release"],
        source: "FAQ Database - Updates",
      },
      {
        name: "issues",
        priority: 13,
        emoji: "🎯",
        keywords: ["issue", "problem", "error", "trouble"],
        searchTerms: ["issue", "problem"],
        source: "FAQ Database - Issues",
      },
    ];
  }

  // Generic strategy processor
  processSearchStrategy(strategy, message, faqData, legalData) {
    const messageLower = message.toLowerCase();

    // Check if message matches strategy keywords
    const isMatch = strategy.keywords.some((keyword) =>
      messageLower.includes(keyword.toLowerCase()),
    );

    if (!isMatch) return null;

    console.log(`${strategy.emoji} ${strategy.name} question detected`);

    // Handle legal search differently
    if (strategy.searchType === "legal") {
      const directLegalMatch = legalData.find(
        (item) =>
          item.title.toLowerCase().includes(messageLower) ||
          messageLower.includes(item.title.toLowerCase()) ||
          item.content.toLowerCase().includes(messageLower),
      );

      if (directLegalMatch) {
        console.log("✓ Found in legal database:", directLegalMatch.title);
        return {
          response: directLegalMatch.content,
          source: `${strategy.source} - ${directLegalMatch.title}`,
          sourceType: "legal",
        };
      }
      return null;
    }

    // Handle FAQ search
    if (strategy.searchTerms) {
      const faqMatch = faqData.find((item) =>
        strategy.searchTerms.some(
          (term) =>
            item.question.toLowerCase().includes(term) ||
            item.answer.toLowerCase().includes(term),
        ),
      );

      if (faqMatch) {
        console.log(`✓ Found ${strategy.name} match:`, faqMatch.question);
        return {
          response: faqMatch.answer,
          source: strategy.source,
          sourceType: "faq",
        };
      }
    }

    return null;
  }

  async searchKnowledgeBase(message) {
    if (!this.initialized) {
      await this.initialize();
    }

    const { faqData, legalData, miscData } = dataService.getData();

    // PRIORITY 1: Exact matches in misc/greeting data
    if (miscData && miscData.length > 0) {
      const exactMisc = miscData.find(
        (item) => item.question.toLowerCase() === message.toLowerCase(),
      );
      if (exactMisc) {
        console.log("✓ Exact misc match:", exactMisc.question);
        return {
          response: exactMisc.answer,
          source: "Misc Database",
          sourceType: "misc",
        };
      }
    }

    // PRIORITY 2: Exact matches in FAQ data
    const exactFaqMatch = faqData.find(
      (item) => item.question.toLowerCase() === message.toLowerCase(),
    );
    if (exactFaqMatch) {
      console.log("✓ Exact FAQ match:", exactFaqMatch.question);
      return {
        response: exactFaqMatch.answer,
        source: "FAQ Database",
        sourceType: "faq",
      };
    }

    // PRIORITY 3: Hybrid Search on Neon (Persistent PDF/Legal data)
    console.log("📄 Searching Neon Hybrid Search...");
    const neonResults = await this.searchLegalDatabase(message);
    if (neonResults.length > 0 && neonResults[0].score >= 0.4) {
      const bestNeonMatch = neonResults[0];
      console.log(`✓ Neon Hybrid match (${bestNeonMatch.score.toFixed(2)}):`, bestNeonMatch.metadata.filename);
      
      const sourceInfo = bestNeonMatch.metadata.page 
        ? `${bestNeonMatch.metadata.filename} (Page ${bestNeonMatch.metadata.page})`
        : bestNeonMatch.metadata.filename;

      return {
        response: `${formatPDFResponse(bestNeonMatch.content)}\n\n*Source: ${sourceInfo}*`,
        source: `Neon DB - ${bestNeonMatch.metadata.filename}`,
        sourceType: "pdf",
      };
    }

    // PRIORITY 4-8: Category-based keyword matching using strategies
    const strategies = this.getSearchStrategies();

    for (const strategy of strategies) {
      const result = this.processSearchStrategy(
        strategy,
        message,
        faqData,
        legalData,
      );
      if (result) {
        return result;
      }
    }

    // PRIORITY 6: Fuzzy search in misc data
    if (this.miscFuse) {
      console.log("🔍 Fuzzy searching misc/greeting data...");
      const miscResults = this.miscFuse.search(message);
      if (miscResults.length > 0 && miscResults[0].score <= 0.3) {
        console.log(
          `✓ Misc fuzzy match (${miscResults[0].score.toFixed(2)}):`,
          miscResults[0].item.question,
        );
        return {
          response: miscResults[0].item.answer,
          source: "Misc Database",
          sourceType: "misc",
        };
      }
    }

    // PRIORITY 7: Enhanced FAQ search
    console.log("🔍 Fuzzy searching FAQ database...");
    const faqResults = this.faqFuse.search(message);
    if (faqResults.length > 0 && faqResults[0].score <= 0.5) {
      console.log(
        `✓ FAQ fuzzy match (${faqResults[0].score.toFixed(2)}):`,
        faqResults[0].item.question,
      );
      return {
        response: faqResults[0].item.answer,
        source: "FAQ Database",
        sourceType: "faq",
      };
    }

    // PRIORITY 8: Enhanced keyword matching using fallback strategies
    console.log("🔍 Enhanced keyword matching...");
    const fallbackStrategies = this.getSearchStrategies();

    for (const strategy of fallbackStrategies) {
      const result = this.processSearchStrategy(
        strategy,
        message,
        faqData,
        legalData,
      );
      if (result) {
        return result;
      }
    }

    // PRIORITY 9: Legal fuzzy search
    console.log("🔍 Fuzzy searching legal database...");
    const legalResults = this.legalFuse.search(message);
    if (legalResults.length > 0 && legalResults[0].score <= 0.4) {
      console.log(
        `✓ Legal fuzzy match (${legalResults[0].score.toFixed(2)}):`,
        legalResults[0].item.title,
      );
      return {
        response: legalResults[0].item.content,
        source: `Legal Database - ${legalResults[0].item.title}`,
        sourceType: "legal",
      };
    }

    // PRIORITY 10: PDF fallback
    if (this.pdfFuse) {
      console.log("📄 Searching PDF fallback...");
      const pdfResults = this.pdfFuse.search(message);
      if (pdfResults.length > 0 && pdfResults[0].score <= 0.6) {
        const bestPdfMatch = pdfResults[0].item;
        console.log(
          `✓ PDF fallback match (${pdfResults[0].score.toFixed(2)}):`,
          bestPdfMatch.title,
        );
        return {
          response: `${formatPDFResponse(bestPdfMatch.content)}\n\n*Source: ${
            bestPdfMatch.source
          } (Part ${bestPdfMatch.chunkIndex}/${bestPdfMatch.totalChunks})*`,
          source: `PDF Document - ${bestPdfMatch.source}`,
          sourceType: "pdf",
        };
      }
    }

    // PRIORITY 11: Best available matches
    return this.findBestAvailableMatch(message);
  }

  findBestAvailableMatch(message) {
    console.log("⚠️ No good matches found, trying best available...");

    const bestFaqMatch = this.faqFuse.search(message, { limit: 1 })[0];
    const bestLegalMatch = this.legalFuse.search(message, { limit: 1 })[0];
    const bestPdfMatch = this.pdfFuse
      ? this.pdfFuse.search(message, { limit: 1 })[0]
      : null;

    const candidates = [
      bestFaqMatch &&
        bestFaqMatch.score <= 0.7 && {
          match: bestFaqMatch,
          type: "faq",
          priority: 1,
        },
      bestLegalMatch &&
        bestLegalMatch.score <= 0.7 && {
          match: bestLegalMatch,
          type: "legal",
          priority: 2,
        },
      bestPdfMatch &&
        bestPdfMatch.score <= 0.8 && {
          match: bestPdfMatch,
          type: "pdf",
          priority: 3,
        },
    ].filter(Boolean);

    if (candidates.length > 0) {
      const best = candidates.reduce((a, b) => {
        if (Math.abs(a.match.score - b.match.score) < 0.1) {
          return a.priority < b.priority ? a : b;
        }
        return a.match.score < b.match.score ? a : b;
      });

      if (best.match.score <= 0.6) {
        // Configuration for different match types
        const matchHandlers = {
          faq: (match) => ({
            response: match.item.answer,
            source: "FAQ Database (Best Match)",
            sourceType: "faq",
            logMessage: `⚠️ Best FAQ match (${match.score.toFixed(2)}): ${
              match.item.question
            }`,
          }),
          legal: (match) => ({
            response: match.item.content,
            source: `Legal Database - ${match.item.title} (Best Match)`,
            sourceType: "legal",
            logMessage: `⚠️ Best legal match (${match.score.toFixed(2)}): ${
              match.item.title
            }`,
          }),
          pdf: (match) => ({
            response: `${formatPDFResponse(match.item.content)}\n\n*Source: ${
              match.item.source
            } (Part ${match.item.chunkIndex}/${match.item.totalChunks})*`,
            source: `PDF Document - ${match.item.source} (Best Match)`,
            sourceType: "pdf",
            logMessage: `⚠️ Best PDF match (${match.score.toFixed(2)}): ${
              match.item.title
            }`,
          }),
        };

        const handler = matchHandlers[best.type];
        if (handler) {
          const result = handler(best.match);
          console.log(result.logMessage);
          return {
            response: result.response,
            source: result.source,
            sourceType: result.sourceType,
          };
        }
      }

      // If we have candidates but scores are too low, provide "Did you mean?" suggestions
      if (candidates.length > 0) {
        console.log("📋 Providing 'did you mean' suggestions...");
        const nearMisses = candidates
          .slice(0, 3)
          .map((candidate) => {
            if (candidate.type === "faq") {
              return candidate.match.item.question;
            } else if (candidate.type === "legal") {
              return candidate.match.item.title;
            } else if (candidate.type === "pdf") {
              return candidate.match.item.title;
            }
          })
          .filter(Boolean);

        if (nearMisses.length > 0) {
          const suggestionsList = nearMisses
            .map((suggestion, index) => `${index + 1}. ${suggestion}`)
            .join("\n");

          return {
            response: `I found some topics that might be related to your question. Click on any suggestion below or ask me more specifically:`,
            source: "AI Assistant - Did You Mean",
            sourceType: "did_you_mean",
            nearMisses: nearMisses,
            buttonSuggestions: nearMisses.map((suggestion) => ({
              text: suggestion,
              action: "ask",
              value: suggestion,
            })),
          };
        }
      }
    }

    // Enhanced fallback with intelligent suggestions
    return this.createIntelligentFallback(message);
  }

  createIntelligentFallback(message) {
    const { faqData, legalData } = dataService.getData();

    // Analyze the message for intent-based suggestions
    const messageLower = message.toLowerCase();
    let intentBasedSuggestions = [];

    // Intent detection patterns
    const intentPatterns = {
      account: ["account", "login", "sign", "register", "profile"],
      payment: ["pay", "bill", "cost", "price", "money", "credit", "charge"],
      support: ["help", "support", "problem", "issue", "trouble", "error"],
      password: ["password", "forgot", "reset", "change"],
      cancel: ["cancel", "stop", "end", "terminate", "quit"],
    };

    // Find intent-based suggestions
    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      if (keywords.some((keyword) => messageLower.includes(keyword))) {
        const relatedQuestions = faqData.filter((item) =>
          keywords.some(
            (keyword) =>
              item.question.toLowerCase().includes(keyword) ||
              item.answer.toLowerCase().includes(keyword),
          ),
        );
        intentBasedSuggestions.push(...relatedQuestions.slice(0, 2));
      }
    }

    // Remove duplicates and limit suggestions
    intentBasedSuggestions = [...new Set(intentBasedSuggestions)].slice(0, 4);

    if (intentBasedSuggestions.length > 0) {
      const suggestionText = intentBasedSuggestions
        .map((item, index) => `${index + 1}. ${item.question}`)
        .join("\n");

      return {
        response: `I couldn't find a specific answer to your question, but based on what you're asking about, these topics might help. Click any suggestion below:`,
        source: "AI Assistant - Smart Suggestions",
        sourceType: "smart_suggestions",
        suggestions: intentBasedSuggestions.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
        buttonSuggestions: intentBasedSuggestions.map((item) => ({
          text: item.question,
          action: "ask",
          value: item.question,
        })),
      };
    }

    // Fallback to popular questions if no intent-based suggestions
    const popularQuestions = [
      "How do I create an account?",
      "How do I reset my password?",
      "How can I contact customer support?",
      "What payment methods do you accept?",
      "How do I cancel my subscription?",
    ];

    // Find popular questions that exist in our FAQ
    const availablePopular = popularQuestions
      .map((q) => faqData.find((item) => item.question === q))
      .filter(Boolean)
      .slice(0, 3);

    // Get a few random helpful questions from FAQ
    const randomQuestions = faqData
      .filter((item) => !popularQuestions.includes(item.question))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const suggestions = [...availablePopular, ...randomQuestions];

    if (suggestions.length > 0) {
      const suggestionText = suggestions
        .map((item, index) => `${index + 1}. ${item.question}`)
        .join("\n");

      return {
        response: `I couldn't find a specific answer to your question, but here are some popular topics that might help. Click any suggestion below:`,
        source: "AI Assistant - Popular Topics",
        sourceType: "popular_suggestions",
        suggestions: suggestions.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
        buttonSuggestions: suggestions.map((item) => ({
          text: item.question,
          action: "ask",
          value: item.question,
        })),
      };
    }

    // If no suggestions available, provide generic fallback WITH button suggestions
    return {
      response:
        "I'm sorry, I couldn't find information related to your question in our knowledge base. Please contact our support team for assistance, or try rephrasing your question.",
      source: "System",
      sourceType: "fallback",
      buttonSuggestions: [
        {
          text: "How do I create an account?",
          action: "ask",
          value: "How do I create an account?",
        },
        {
          text: "How do I reset my password?",
          action: "ask",
          value: "How do I reset my password?",
        },
        {
          text: "How can I contact customer support?",
          action: "ask",
          value: "How can I contact customer support?",
        },
        {
          text: "What payment methods do you accept?",
          action: "ask",
          value: "What payment methods do you accept?",
        },
        {
          text: "What are your terms of service?",
          action: "ask",
          value: "What are your terms of service?",
        },
      ],
    };
  }

  getStatus() {
    const { faqData, legalData, miscData, pdfDocuments, allSearchableData } =
      dataService.getData();

    return {
      status: "running",
      initialized: this.initialized,
      dataSources: {
        faq: faqData.length,
        legal: legalData.length,
        misc: miscData.length,
        pdfs: pdfDocuments.length,
        totalSearchable: allSearchableData.length,
      },
      pdfDocuments: pdfDocuments.map((pdf) => ({
        filename: pdf.filename,
        title: pdf.title,
        pages: pdf.pages,
        extractedAt: pdf.extractedAt,
      })),
    };
  }
}

const searchService = new SearchService();

module.exports = {
  searchService,
  initializeSearchService: () => searchService.initialize(),
};
