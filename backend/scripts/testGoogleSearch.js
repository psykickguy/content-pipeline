require("dotenv").config();
const {
  searchCompetitorArticles,
} = require("../services/googleSearch.service");

(async () => {
  const title = "Chatbots Magic: Beginner’s Guidebook";

  const results = await searchCompetitorArticles(title);

  console.log("🔍 Google Results:\n");
  results.forEach((r, i) => console.log(`${i + 1}. ${r}`));
})();
