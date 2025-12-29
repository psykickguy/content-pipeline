const axios = require("axios");
const cheerio = require("cheerio");
const cleanText = require("../utils/cleanText");

const BLOG_LIST_URL = "https://beyondchats.com/blogs/";
const BASE_URL = "https://beyondchats.com";

// 🔹 Remove known non-editorial prefixes injected by CMS
function removeLeadingJunk(text) {
  const JUNK_PREFIXES = ["Resources Blogs Case studies Success stories"];

  let cleaned = text.trim();

  for (const junk of JUNK_PREFIXES) {
    if (cleaned.startsWith(junk)) {
      cleaned = cleaned.slice(junk.length).trim();
    }
  }

  return cleaned;
}

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

      // 1️⃣ Title
      const title = $$("h1").first().text().trim();
      if (!title) continue;

      // 2️⃣ Find main content container (largest text block)
      let content = "";

      const candidateDiv = $$("div")
        .filter((_, el) => {
          const text = $$(el).text();
          return text && text.length > 1500;
        })
        .first();

      if (!candidateDiv.length) continue;

      // 3️⃣ Stop phrases (footer / comments)
      const STOP_PHRASES = [
        "For more such amazing content",
        "Your email address will not be published",
        "Save my name",
        "Required fields are marked",
      ];

      // 4️⃣ Extract article text
      candidateDiv.find("p, h2, h3, li").each((_, el) => {
        const text = $$(el).text().trim();
        if (!text || text.length < 40) return;

        if (STOP_PHRASES.some((phrase) => text.includes(phrase))) {
          return false; // break
        }

        content += text + "\n\n";
      });

      // ✅ Correct cleanup order
      let cleanedContent = cleanText(content);
      cleanedContent = removeLeadingJunk(cleanedContent);

      // Safety guard
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
