require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { fetchOldestArticles } = require("../services/scraper.service");

(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();

    console.log("\n🚀 Running oldest articles scraper...\n");
    const articles = await fetchOldestArticles();

    console.log("\n===== 🏆 FINAL RESULT =====\n");

    articles.forEach((a, i) => {
      console.log(
        `${i + 1}. ${a.title}\n` +
          `   ${a.sourceUrl}\n` +
          `   Published: ${a.publishedAt?.toDateString?.()}\n` +
          `   Content length: ${a.originalContent.length}\n`
      );
    });

    console.log("✅ Done");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
})();
