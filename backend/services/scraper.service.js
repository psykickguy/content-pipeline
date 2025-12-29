const axios = require("axios");
const cheerio = require("cheerio");
const cleanText = require("../utils/cleanText");

const BLOG_LIST_URL = "https://beyondchats.com/blogs/";
const BASE_URL = "https://beyondchats.com";

// slug helper
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function fetchOldestArticles() {
  const { data: html } = await axios.get(BLOG_LIST_URL, { timeout: 15000 });
  const $ = cheerio.load(html);

  const articleLinks = [];

  $("a[href^='/blogs/']").each((_, el) => {
    const href = $(el).attr("href");
    if (href && href !== "/blogs/" && !href.includes("/tag/")) {
      articleLinks.push(`${BASE_URL}${href}`);
    }
  });

  const uniqueLinks = [...new Set(articleLinks)];
  const oldestFive = uniqueLinks.reverse().slice(0, 5);

  const articles = [];

  for (const url of oldestFive) {
    try {
      const { data: articleHtml } = await axios.get(url, { timeout: 15000 });
      const $$ = cheerio.load(articleHtml);

      // Title
      const title = $$("h1").first().text().trim();
      if (!title) continue;

      // Find the largest content block
      let content = "";

      const candidateDivs = $$("div").filter((_, el) => {
        const text = $$(el).text();
        return text && text.length > 1500;
      });

      if (!candidateDivs.length) continue;

      candidateDivs
        .first()
        .find("p, h2, h3, li")
        .each((_, el) => {
          const text = $$(el).text().trim();
          if (text.length > 40) {
            content += text + "\n\n";
          }
        });

      const cleanedContent = cleanText(content);
      if (cleanedContent.length < 500) continue;

      articles.push({
        title,
        slug: slugify(title),
        originalContent: cleanedContent,
        sourceUrl: url,
      });
    } catch (err) {
      console.error(`Failed to scrape ${url}: ${err.message}`);
    }
  }

  return articles;
}

module.exports = { fetchOldestArticles };
