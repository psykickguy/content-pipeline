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

// 🔹 Dynamically detect the last blog page
async function getLastBlogPage() {
  const { data: html } = await axios.get(BLOG_LIST_URL, { timeout: 15000 });
  const $ = cheerio.load(html);

  let maxPage = 1;

  $("a[href*='/blogs/page/']").each((_, el) => {
    const href = $(el).attr("href");
    const match = href.match(/\/blogs\/page\/(\d+)/);
    if (match) {
      maxPage = Math.max(maxPage, parseInt(match[1], 10));
    }
  });

  return maxPage;
}

// slug helper
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function fetchOldestArticles() {
  // ✅ STEP 1: Collect the true oldest article links via pagination
  const oldestArticleLinks = [];
  const lastPage = await getLastBlogPage();
  const secondLastPage = lastPage - 1;

  for (let page = lastPage; page >= 1; page--) {
    const pageUrl =
      page === 1 ? BLOG_LIST_URL : `${BLOG_LIST_URL}page/${page}/`;

    const { data: pageHtml } = await axios.get(pageUrl, { timeout: 15000 });
    const $page = cheerio.load(pageHtml);

    const pageLinks = [];

    $page("a[href]").each((_, el) => {
      const href = $page(el).attr("href");

      if (
        href &&
        href.startsWith("/blogs/") &&
        href !== "/blogs/" &&
        !href.includes("/tag/") &&
        !href.includes("/page/")
      ) {
        pageLinks.push(`${BASE_URL}${href}`);
      }
    });

    // Oldest articles are at the bottom of each page
    for (let i = pageLinks.length - 1; i >= 0; i--) {
      if (!oldestArticleLinks.includes(pageLinks[i])) {
        oldestArticleLinks.push(pageLinks[i]);
      }

      if (oldestArticleLinks.length === 5) break;
    }

    // ✅ CRITICAL FIX: stop ONLY after processing page 14
    if (oldestArticleLinks.length === 5 && page <= secondLastPage) {
      break;
    }
  }

  // ✅ STEP 2: Scrape article content (already-correct logic)
  const articles = [];

  for (const url of oldestArticleLinks) {
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

      // ✅ Final cleanup pass
      let cleanedContent = cleanText(content);
      cleanedContent = removeLeadingJunk(cleanedContent);

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
