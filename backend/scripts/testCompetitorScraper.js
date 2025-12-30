const {
  scrapeCompetitorArticle,
} = require("../services/competitorScraper.service");

(async () => {
  const url =
    "https://www.gcc-marketing.com/chatbot-development-a-comprehensive-guide-for-beginners/";

  const result = await scrapeCompetitorArticle(url);

  if (!result) {
    console.log("❌ No result");
    return;
  }

  console.log("\n--- BASIC CHECKS ---\n");
  console.log("Title:", result.title);
  console.log("URL:", result.url);
  console.log("Total characters:", result.content.length);
  console.log("Total words:", result.content.split(/\s+/).length);

  console.log("\n--- CONTENT PREVIEW (FIRST 800 CHARS) ---\n");
  console.log(result.content.slice(0, 800));

  console.log("\n--- CONTENT PREVIEW (LAST 800 CHARS) ---\n");
  console.log(result.content.slice(-800));
})();
