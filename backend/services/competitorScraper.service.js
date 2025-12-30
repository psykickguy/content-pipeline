const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

// 🔹 Allow bad certs (scraping only)
const insecureAgent = new https.Agent({
  rejectUnauthorized: false,
});

// 🔹 Small UA pool (enough to bypass naive rate limits)
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, {
        timeout: 20000,
        httpsAgent: insecureAgent,
        headers: {
          "User-Agent":
            USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
          Accept: "text/html",
          "Accept-Language": "en-US,en;q=0.9",
          Referer: "https://www.google.com/",
        },
      });
    } catch (err) {
      if (err.response?.status === 429 && attempt < retries) {
        const delay = 1500 * attempt; // exponential backoff
        console.warn(`⚠️ 429 hit, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

/**
 * Scrape main article content from competitor blog
 */
async function scrapeCompetitorArticle(url) {
  try {
    // 🔹 polite delay before first hit
    await sleep(800);

    const { data: html } = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    // 🔹 Robust title extraction
    const title =
      $("meta[property='og:title']").attr("content") ||
      $("meta[name='title']").attr("content") ||
      $("h1").first().text().trim();

    if (!title) throw new Error("Title not found");

    // 🔹 Locate best content container
    let bestNode = null;
    let maxTextLength = 0;

    $("article, div").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > maxTextLength && text.length > 1500) {
        maxTextLength = text.length;
        bestNode = el;
      }
    });

    if (!bestNode) throw new Error("Main content container not found");

    // 🧹 Remove junk containers
    $(bestNode)
      .find("aside, footer, nav, form, button, iframe, script, style")
      .remove();

    // ✅ SAFE EXTRACTION
    let content = "";
    let paragraphCount = 0;

    const SOFT_SKIP_PHRASES = [
      "medium member",
      "responses",
      "claps",
      "recommended",
    ];

    const HARD_STOP_PHRASES = [
      "leave a comment",
      "related articles",
      "author bio",
      "about the author",
      "join us",
      "register here",
      "send me a message",
      "we launched",
      "private community",
      "sign up",
      "click here",
    ];

    $(bestNode)
      .find("p, h2, h3, li")
      .each((_, el) => {
        const text = $(el).text().trim();
        if (!text || text.length < 40) return;

        const lower = text.toLowerCase();

        // 🔹 INTRO PROMO SKIP
        if (
          paragraphCount < 6 &&
          ((lower.startsWith("(") && lower.endsWith(")")) ||
            lower.includes("stop reading") ||
            lower.includes("do you work in") ||
            lower.includes("p.s") ||
            lower.includes("p.p.s"))
        ) {
          return;
        }

        if (SOFT_SKIP_PHRASES.some((p) => lower.includes(p))) return;

        if (
          paragraphCount > 15 &&
          HARD_STOP_PHRASES.some((p) => lower.includes(p))
        ) {
          return false;
        }

        content += text + "\n\n";
        paragraphCount++;
      });

    content = content.replace(/\n{3,}/g, "\n\n").trim();

    if (content.length < 800) {
      throw new Error("Extracted content too short");
    }

    return { url, title, content };
  } catch (err) {
    console.error(`❌ Failed to scrape ${url}: ${err.message}`);
    return null;
  }
}

module.exports = { scrapeCompetitorArticle };
