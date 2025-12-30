require("dotenv").config();
const axios = require("axios");

const {
  searchCompetitorArticles,
} = require("../services/googleSearch.service");

const {
  scrapeCompetitorArticle,
} = require("../services/competitorScraper.service");

const { rewriteArticleWithLLM } = require("../services/llm.service");

const API_BASE = "http://localhost:8080/articles";

(async () => {
  console.log("🚀 Phase-2 Orchestrator Started\n");

  // 1️⃣ Fetch all articles
  const { data: articles } = await axios.get(API_BASE);

  for (const article of articles) {
    if (article.isEnhanced) {
      console.log(`⏭️ Skipping already enhanced: ${article.title}`);
      continue;
    }

    console.log(`\n🔍 Processing: ${article.title}`);

    // 2️⃣ Google Search
    const competitorUrls = await searchCompetitorArticles(article.title);

    if (competitorUrls.length < 2) {
      console.log("⚠️ Not enough competitors, skipping");
      continue;
    }

    // 3️⃣ Scrape competitors
    const competitor1 = await scrapeCompetitorArticle(competitorUrls[0]);
    const competitor2 = await scrapeCompetitorArticle(competitorUrls[1]);

    if (!competitor1 || !competitor2) {
      console.log("⚠️ Failed competitor scrape, skipping");
      continue;
    }

    // 4️⃣ LLM Rewrite
    const rewritten = await rewriteArticleWithLLM({
      original: article,
      competitor1,
      competitor2,
    });

    // ✅ 5️⃣ UPDATE EXISTING ARTICLE (NO DUPLICATES)
    await axios.put(`${API_BASE}/${article._id}`, {
      title: rewritten.title,
      enhancedContent: rewritten.content,
      citations: rewritten.citations.map((c) => c.url),
      isEnhanced: true,
    });

    console.log(`✅ Enhanced & published: ${rewritten.title}`);
  }

  console.log("\n🏁 Phase-2 Completed");
})();
