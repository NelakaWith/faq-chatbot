const Fuse = require("fuse.js");
const dataService = require("./dataService");
const { formatPDFResponse } = require("../utils/formatters");

class SearchService {
  constructor() {
    this.faqFuse = null;
    this.legalFuse = null;
    this.miscFuse = null;
    this.pdfFuse = null;
    this.allDataFuse = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    console.log("🔍 Initializing search service...");

    // Load all data
    await dataService.loadAllData();

    // Create Fuse instances
    this.createFuseInstances();

    this.initialized = true;
    console.log("✅ Search service initialized");
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
      (item) => item.type === "pdf_chunk"
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
      messageLower.includes(keyword.toLowerCase())
    );

    if (!isMatch) return null;

    console.log(`${strategy.emoji} ${strategy.name} question detected`);

    // Handle legal search differently
    if (strategy.searchType === "legal") {
      const directLegalMatch = legalData.find(
        (item) =>
          item.title.toLowerCase().includes(messageLower) ||
          messageLower.includes(item.title.toLowerCase()) ||
          item.content.toLowerCase().includes(messageLower)
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
            item.answer.toLowerCase().includes(term)
        )
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
        (item) => item.question.toLowerCase() === message.toLowerCase()
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
      (item) => item.question.toLowerCase() === message.toLowerCase()
    );
    if (exactFaqMatch) {
      console.log("✓ Exact FAQ match:", exactFaqMatch.question);
      return {
        response: exactFaqMatch.answer,
        source: "FAQ Database",
        sourceType: "faq",
      };
    }

    // PRIORITY 3-7: Category-based keyword matching using strategies
    const strategies = this.getSearchStrategies();

    for (const strategy of strategies) {
      const result = this.processSearchStrategy(
        strategy,
        message,
        faqData,
        legalData
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
          miscResults[0].item.question
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
        faqResults[0].item.question
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
        legalData
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
        legalResults[0].item.title
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
          bestPdfMatch.title
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
            response: `I found some topics that might be related to your question:\n\n${suggestionsList}\n\nDid you mean to ask about any of these? You can ask me more specifically about these topics.`,
            source: "AI Assistant - Did You Mean",
            sourceType: "did_you_mean",
            nearMisses: nearMisses,
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
              item.answer.toLowerCase().includes(keyword)
          )
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
        response: `I couldn't find a specific answer to your question, but based on what you're asking about, these topics might help:\n\n${suggestionText}\n\nYou can ask me about any of these topics specifically. If you need immediate assistance, please contact our support team at support@company.com.`,
        source: "AI Assistant - Smart Suggestions",
        sourceType: "smart_suggestions",
        suggestions: intentBasedSuggestions.map((item) => ({
          question: item.question,
          answer: item.answer,
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
        response: `I couldn't find a specific answer to your question, but here are some popular topics that might help:\n\n${suggestionText}\n\nYou can ask me about any of these topics, or try rephrasing your question. If you need immediate assistance, please contact our support team at support@company.com.`,
        source: "AI Assistant - Popular Topics",
        sourceType: "popular_suggestions",
        suggestions: suggestions.map((item) => ({
          question: item.question,
          answer: item.answer,
        })),
      };
    }

    // If no suggestions available, provide category guidance
    return {
      response: `I couldn't find specific information about that topic. Here are some areas I can help you with:

• **Account Management** - Creating accounts, password resets, profile settings
• **Billing & Payments** - Payment methods, subscription management, invoices
• **Technical Support** - Troubleshooting, how-to guides, feature questions
• **Policies & Terms** - Privacy policy, terms of service, legal information

Try asking about any of these topics, or contact our support team at support@company.com for personalized assistance.`,
      source: "AI Assistant - Category Guide",
      sourceType: "category_guide",
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
