const puppeteer = require("puppeteer");

const BLOG_BASE = "https://beyondchats.com/blogs/";
const BASE_URL = "https://beyondchats.com";

async function getLastPage(page) {
  // grab pagination links
  const pages = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && h.includes("/blogs/page/"))
      .map((h) => parseInt(h.match(/page\/(\d+)/)?.[1]))
      .filter(Boolean);
  });

  return Math.max(...pages);
}

async function getOldestFiveBlogUrls() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(BLOG_BASE, { waitUntil: "networkidle2" });

  const lastPage = await getLastPage(page);
  console.log("Last page detected:", lastPage);

  const results = [];

  for (let p = lastPage; p >= 1; p--) {
    const url = p === 1 ? BLOG_BASE : `${BLOG_BASE}page/${p}/`;
    console.log("Scraping:", url);

    await page.goto(url, { waitUntil: "networkidle2" });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter(
          (h) =>
            h.includes("/blogs/") &&
            !h.includes("/blogs/page/") &&
            !h.includes("/tag/")
        );
    });

    // bottom → top = oldest → newer
    for (let i = links.length - 1; i >= 0; i--) {
      const full = BASE_URL + links[i];
      if (!results.includes(full)) {
        results.push(full);
      }
      if (results.length === 5) break;
    }

    if (results.length === 5) break;
  }

  await browser.close();
  return results;
}

// 🔎 TEST
(async () => {
  const urls = await getOldestFiveBlogUrls();
  console.log("\n===== 🏆 TRUE OLDEST 5 =====\n");
  urls.forEach((u, i) => console.log(`${i + 1}. ${u}`));
})();
