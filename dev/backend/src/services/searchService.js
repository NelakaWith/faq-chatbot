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

    // PRIORITY 3: Payment method questions
    const paymentKeywords = [
      "cryptocurrency",
      "crypto",
      "bitcoin",
      "ethereum",
      "digital currency",
      "blockchain",
      "payment method",
      "pay with",
      "paying with",
      "accept cryptocurrency",
      "accept crypto",
      "online payment",
      "digital payment",
      "electronic payment",
      "virtual currency",
      "digital wallet",
      "bitcoin payment",
      "crypto payment",
      "how to pay",
      "payment options",
      "payment accepted",
      "fee payment",
      "penalty payment",
    ];
    const isPaymentQuestion = paymentKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (isPaymentQuestion) {
      console.log("💳 Payment method question detected");
      const paymentFaq = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("cryptocurrency") ||
          item.question.toLowerCase().includes("crypto") ||
          item.question.toLowerCase().includes("payment") ||
          item.question.toLowerCase().includes("digital currency")
      );
      if (paymentFaq) {
        console.log("✓ Found payment method in FAQ:", paymentFaq.question);
        return {
          response: paymentFaq.answer,
          source: "FAQ Database - Payment Methods",
          sourceType: "faq",
        };
      }
    }

    // PRIORITY 4: Pricing questions
    const pricingKeywords = [
      "cost",
      "price",
      "pricing",
      "much",
      "fee",
      "charge",
      "rate",
      "expensive",
    ];
    const isPricingQuestion = pricingKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (isPricingQuestion) {
      console.log("💰 Pricing question detected");
      const pricingFaq = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("pricing") ||
          item.question.toLowerCase().includes("cost") ||
          item.question.toLowerCase().includes("fee")
      );
      if (pricingFaq) {
        console.log("✓ Found pricing in FAQ:", pricingFaq.question);
        return {
          response: pricingFaq.answer,
          source: "FAQ Database - Pricing",
          sourceType: "faq",
        };
      }
    }

    // PRIORITY 5: Legal questions
    const legalKeywords = [
      "penalty",
      "penalties",
      "administrative penalty",
      "fine",
      "fines",
      "violation",
      "violations",
      "compliance",
      "non-compliance",
      "enforcement",
      "disciplinary",
      "discipline",
      "suspension",
      "revocation",
      "terms",
      "policy",
      "policies",
      "liability",
      "legal",
      "privacy",
      "data",
      "cancel",
      "cancellation",
      "warranty",
      "warranties",
      "dispute",
      "arbitration",
      "intellectual",
      "property",
      "copyright",
      "payment",
      "refund",
      "disclosure",
      "confidential",
      "confidentiality",
      "appeal",
      "appeals",
      "hearing",
      "tribunal",
      "court",
      "judgment",
      "order",
      "investigation",
      "complaint",
      "complaint process",
      "regulatory",
      "regulation",
      "legislation",
      "statutory",
      "bylaw",
      "code of ethics",
      "professional conduct",
      "misconduct",
      "breach",
      "contravention",
      "non-compliance",
      "administrative authority",
      "registrar",
      "director",
      "RECO",
      "real estate council",
      "ontario real estate",
      "professional standards",
      "consumer protection",
      "client protection",
    ];
    const isLegalQuestion = legalKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (isLegalQuestion) {
      console.log("⚖️ Legal question detected");
      const directLegalMatch = legalData.find(
        (item) =>
          item.title.toLowerCase().includes(message.toLowerCase()) ||
          message.toLowerCase().includes(item.title.toLowerCase()) ||
          item.content.toLowerCase().includes(message.toLowerCase())
      );
      if (directLegalMatch) {
        console.log("✓ Found in legal database:", directLegalMatch.title);
        return {
          response: directLegalMatch.content,
          source: `Legal Database - ${directLegalMatch.title}`,
          sourceType: "legal",
        };
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

    // Enhanced keyword matching
    const messageLower = message.toLowerCase();

    // Registration and licensing queries
    if (
      messageLower.includes("registration") ||
      messageLower.includes("license") ||
      messageLower.includes("licence") ||
      messageLower.includes("renew") ||
      messageLower.includes("qualify")
    ) {
      console.log("🎯 Detected registration/licensing query");
      const registrationQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("registration") ||
          item.question.toLowerCase().includes("license") ||
          item.question.toLowerCase().includes("licence") ||
          item.answer.toLowerCase().includes("registration") ||
          item.answer.toLowerCase().includes("license")
      );
      if (registrationQuery) {
        console.log("✓ Found registration match:", registrationQuery.question);
        return {
          response: registrationQuery.answer,
          source: "FAQ Database - Registration",
          sourceType: "faq",
        };
      }
    }

    // Education and training queries
    if (
      messageLower.includes("education") ||
      messageLower.includes("training") ||
      messageLower.includes("course") ||
      messageLower.includes("continuing education") ||
      messageLower.includes("professional development")
    ) {
      console.log("🎯 Detected education query");
      const educationQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("education") ||
          item.question.toLowerCase().includes("training") ||
          item.question.toLowerCase().includes("course") ||
          item.answer.toLowerCase().includes("education") ||
          item.answer.toLowerCase().includes("training")
      );
      if (educationQuery) {
        console.log("✓ Found education match:", educationQuery.question);
        return {
          response: educationQuery.answer,
          source: "FAQ Database - Education",
          sourceType: "faq",
        };
      }
    }

    // Insurance and bonding queries
    if (
      messageLower.includes("insurance") ||
      messageLower.includes("bond") ||
      messageLower.includes("coverage") ||
      messageLower.includes("liability coverage")
    ) {
      console.log("🎯 Detected insurance query");
      const insuranceQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("insurance") ||
          item.question.toLowerCase().includes("bond") ||
          item.answer.toLowerCase().includes("insurance") ||
          item.answer.toLowerCase().includes("bond")
      );
      if (insuranceQuery) {
        console.log("✓ Found insurance match:", insuranceQuery.question);
        return {
          response: insuranceQuery.answer,
          source: "FAQ Database - Insurance",
          sourceType: "faq",
        };
      }
    }

    // Trust account queries
    if (
      messageLower.includes("trust account") ||
      messageLower.includes("trust fund") ||
      messageLower.includes("client money") ||
      messageLower.includes("deposit")
    ) {
      console.log("🎯 Detected trust account query");
      const trustQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("trust") ||
          item.answer.toLowerCase().includes("trust") ||
          item.question.toLowerCase().includes("deposit") ||
          item.answer.toLowerCase().includes("deposit")
      );
      if (trustQuery) {
        console.log("✓ Found trust account match:", trustQuery.question);
        return {
          response: trustQuery.answer,
          source: "FAQ Database - Trust Accounts",
          sourceType: "faq",
        };
      }
    }

    // Specialization queries
    if (
      messageLower.includes("specialist") ||
      messageLower.includes("specialization") ||
      messageLower.includes("certification") ||
      messageLower.includes("designation")
    ) {
      console.log("🎯 Detected specialization query");
      const specializationQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("specialist") ||
          item.question.toLowerCase().includes("specialization") ||
          item.answer.toLowerCase().includes("specialist") ||
          item.answer.toLowerCase().includes("specialization")
      );
      if (specializationQuery) {
        console.log(
          "✓ Found specialization match:",
          specializationQuery.question
        );
        return {
          response: specializationQuery.answer,
          source: "FAQ Database - Specialization",
          sourceType: "faq",
        };
      }
    }

    // Multiple representation queries
    if (
      messageLower.includes("multiple representation") ||
      messageLower.includes("dual agency") ||
      messageLower.includes("conflict of interest")
    ) {
      console.log("🎯 Detected multiple representation query");
      const multipleRepQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("multiple representation") ||
          item.question.toLowerCase().includes("multiple parties") ||
          item.answer.toLowerCase().includes("multiple representation") ||
          item.answer.toLowerCase().includes("multiple parties")
      );
      if (multipleRepQuery) {
        console.log(
          "✓ Found multiple representation match:",
          multipleRepQuery.question
        );
        return {
          response: multipleRepQuery.answer,
          source: "FAQ Database - Multiple Representation",
          sourceType: "faq",
        };
      }
    }

    // Effective date queries
    if (messageLower.includes("effective") && messageLower.includes("date")) {
      console.log("🎯 Detected effective date query");
      const effectiveQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("effect") ||
          item.answer.toLowerCase().includes("effect")
      );
      if (effectiveQuery) {
        console.log("✓ Found effective date match:", effectiveQuery.question);
        return {
          response: effectiveQuery.answer,
          source: "FAQ Database - Keyword Match",
          sourceType: "faq",
        };
      }
    }

    // Penalty queries
    if (
      messageLower.includes("penalty") ||
      messageLower.includes("penalties") ||
      messageLower.includes("violation") ||
      messageLower.includes("fine")
    ) {
      console.log("🎯 Detected penalty query");
      const penaltyQuery = faqData.find(
        (item) =>
          item.question.toLowerCase().includes("penalt") ||
          item.answer.toLowerCase().includes("penalt")
      );
      if (penaltyQuery) {
        console.log("✓ Found penalty match:", penaltyQuery.question);
        return {
          response: penaltyQuery.answer,
          source: "FAQ Database - Keyword Match",
          sourceType: "faq",
        };
      }
    }

    // PRIORITY 8: Legal fuzzy search
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

    // PRIORITY 9: PDF fallback
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

    // PRIORITY 10: Best available matches
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
        switch (best.type) {
          case "faq":
            console.log(
              `⚠️ Best FAQ match (${best.match.score.toFixed(2)}):`,
              best.match.item.question
            );
            return {
              response: best.match.item.answer,
              source: "FAQ Database (Best Match)",
              sourceType: "faq",
            };
          case "legal":
            console.log(
              `⚠️ Best legal match (${best.match.score.toFixed(2)}):`,
              best.match.item.title
            );
            return {
              response: best.match.item.content,
              source: `Legal Database - ${best.match.item.title} (Best Match)`,
              sourceType: "legal",
            };
          case "pdf":
            console.log(
              `⚠️ Best PDF match (${best.match.score.toFixed(2)}):`,
              best.match.item.title
            );
            return {
              response: `${formatPDFResponse(
                best.match.item.content
              )}\n\n*Source: ${best.match.item.source} (Part ${
                best.match.item.chunkIndex
              }/${best.match.item.totalChunks})*`,
              source: `PDF Document - ${best.match.item.source} (Best Match)`,
              sourceType: "pdf",
            };
        }
      }
    }

    // Final fallback
    console.log("❌ No matches found in any data source");
    return {
      response:
        "I'm sorry, I couldn't find information related to your question in our knowledge base. Please contact our support team for assistance, or try rephrasing your question.",
      source: "System",
      sourceType: "fallback",
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
