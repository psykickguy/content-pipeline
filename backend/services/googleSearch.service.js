const axios = require("axios");

const SERPER_URL = "https://google.serper.dev/search";

// 🔹 Robust article validation heuristic (FINAL)
function isValidArticle(url) {
  try {
    if (!url) return false;

    const lower = url.toLowerCase();
    const parsed = new URL(url);
    const path = parsed.pathname;
    const hostname = parsed.hostname;

    // ❌ Exclude your own site
    if (hostname.includes("beyondchats.com")) return false;

    // ❌ Exclude social + ecommerce + aggregators
    const BLOCKED_DOMAINS = [
      "amazon.",
      "flipkart.",
      "ebay.",
      "pinterest.",
      "youtube.",
      "facebook.",
      "instagram.",
      "twitter.",
      "x.com",
      "linkedin.",
      "reddit.",
      "quora.",
    ];

    if (BLOCKED_DOMAINS.some((d) => hostname.includes(d))) {
      return false;
    }

    // ❌ Non-articles
    if (lower.endsWith(".pdf")) return false;
    if (lower.includes("/tag/")) return false;
    if (lower.includes("/category/")) return false;

    // ❌ Reject homepages or shallow URLs
    if (path === "/" || path.split("/").length < 2) return false;

    return true;
  } catch {
    return false;
  }
}

async function searchCompetitorArticles(title) {
  const response = await axios.post(
    SERPER_URL,
    {
      q: title,
      num: 10, // fetch more, filter later
    },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const results = response.data.organic || [];

  const filtered = results.map((r) => r.link).filter(isValidArticle);

  // ✅ Return top 2 valid competitor articles
  return filtered.slice(0, 2);
}

module.exports = { searchCompetitorArticles };
