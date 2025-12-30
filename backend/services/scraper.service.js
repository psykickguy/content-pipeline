const axios = require("axios");
const cheerio = require("cheerio");
const cleanText = require("../utils/cleanText");
const Article = require("../models/Article"); // ✅ ADD THIS

const BLOG_LIST_URL = "https://beyondchats.com/blogs/";

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

// 🔹 Dynamically detect the last blog page
async function getLastBlogPage() {
  const { data } = await axios.get(BLOG_LIST_URL, { timeout: 15000 });
  const $ = cheerio.load(data);

  let max = 1;
  $("a[href*='/blogs/page/']").each((_, el) => {
    const m = $(el)
      .attr("href")
      ?.match(/page\/(\d+)/);
    if (m) max = Math.max(max, Number(m[1]));
  });

  return max;
}

// 🔹 slug helper
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * ✅ FINAL, CORRECT IMPLEMENTATION
 */
async function fetchOldestArticles() {
  const lastPage = await getLastBlogPage();
  const posts = [];

  // 🔹 STEP 1: Collect ALL posts with publish dates
  for (let page = 1; page <= lastPage; page++) {
    const pageUrl =
      page === 1 ? BLOG_LIST_URL : `${BLOG_LIST_URL}page/${page}/`;

    console.log("Scraping list:", pageUrl);

    const { data } = await axios.get(pageUrl, { timeout: 15000 });
    const $ = cheerio.load(data);

    $("article.entry-card").each((_, article) => {
      const title = $(article).find("h2.entry-title a").text().trim();
      const link = $(article).find("h2.entry-title a").attr("href");
      const datetime = $(article).find("time").attr("datetime");

      if (title && link && datetime) {
        posts.push({
          title,
          link,
          date: new Date(datetime),
        });
      }
    });
  }

  // 🔹 STEP 2: Sort by TRUE publish date (oldest first)
  posts.sort((a, b) => a.date - b.date);
  const oldestFive = posts.slice(0, 5);

  // 🔹 STEP 3: Scrape article content
  const articles = [];

  for (const post of oldestFive) {
    try {
      const { data: articleHtml } = await axios.get(post.link, {
        timeout: 15000,
      });
      const $$ = cheerio.load(articleHtml);

      const title = $$("h1").first().text().trim();
      if (!title) continue;

      let content = "";

      const candidateDiv = $$("div")
        .filter((_, el) => {
          const text = $$(el).text();
          return text && text.length > 1500;
        })
        .first();

      if (!candidateDiv.length) continue;

      const STOP_PHRASES = [
        "For more such amazing content",
        "Your email address will not be published",
        "Save my name",
        "Required fields are marked",
      ];

      candidateDiv.find("p, h2, h3, li").each((_, el) => {
        const text = $$(el).text().trim();
        if (!text || text.length < 40) return;

        if (STOP_PHRASES.some((p) => text.includes(p))) {
          return false;
        }

        content += text + "\n\n";
      });

      let cleanedContent = cleanText(content);
      cleanedContent = removeLeadingJunk(cleanedContent);

      if (cleanedContent.length < 500) continue;

      articles.push({
        title,
        slug: slugify(title),
        originalContent: cleanedContent,
        sourceUrl: post.link,
        publishedAt: post.date,
      });
    } catch (err) {
      console.error(`Failed to scrape ${post.link}: ${err.message}`);
    }
  }

  // 🔹 STEP 4: Persist to MongoDB (IDEMPOTENT ✅)
  for (const article of articles) {
    await Article.updateOne(
      { sourceUrl: article.sourceUrl },
      { $setOnInsert: article },
      { upsert: true }
    );
  }

  return articles;
}

module.exports = { fetchOldestArticles };
