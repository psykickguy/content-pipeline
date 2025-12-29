const axios = require("axios");
const cheerio = require("cheerio");

const BLOG_LIST_URL = "https://beyondchats.com/blogs/";
const BASE_URL = "https://beyondchats.com";

async function getLastBlogPage() {
  const { data: html } = await axios.get(BLOG_LIST_URL, { timeout: 15000 });
  const $ = cheerio.load(html);

  let maxPage = 1;

  $("a[href*='/blogs/page/']").each((_, el) => {
    const href = $(el).attr("href");
    const match = href.match(/\/blogs\/page\/(\d+)/);
    if (match) {
      maxPage = Math.max(maxPage, Number(match[1]));
    }
  });

  return maxPage;
}

async function testBlogTitleOrder() {
  const lastPage = await getLastBlogPage();
  const orderedTitles = [];

  for (let page = 1; page <= lastPage; page++) {
    const pageUrl =
      page === 1 ? BLOG_LIST_URL : `${BLOG_LIST_URL}page/${page}/`;

    console.log(`Scraping page ${page}: ${pageUrl}`);

    const { data: html } = await axios.get(pageUrl, { timeout: 15000 });
    const $ = cheerio.load(html);

    // ✅ WordPress-safe selector for real blog titles ONLY
    $(".entry-title a[href^='/blogs/']").each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href");

      if (title) {
        orderedTitles.push({
          title,
          url: `${BASE_URL}${href}`,
          page,
        });
      }
    });
  }

  console.log("\n===== BLOG TITLES IN SITE ORDER =====\n");

  orderedTitles.forEach((item, index) => {
    console.log(`${index + 1}. [page ${item.page}] ${item.title}`);
  });

  console.log(`\nTotal titles found: ${orderedTitles.length}`);
}

testBlogTitleOrder().catch(console.error);
