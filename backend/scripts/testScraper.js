const { fetchOldestArticles } = require("../services/scraper.service");

(async () => {
  const articles = await fetchOldestArticles();
  console.log(JSON.stringify(articles, null, 2));
})();
