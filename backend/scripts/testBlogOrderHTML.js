const axios = require("axios");
const cheerio = require("cheerio");

const BLOG_LIST_URL = "https://beyondchats.com/blogs/";
const BASE_URL = "https://beyondchats.com";

async function getLastBlogPage() {
  const { data: html } = await axios.get(BLOG_LIST_URL);
  const $ = cheerio.load(html);

  let maxPage = 1;
  $("a[href*='/blogs/page/']").each((_, el) => {
    const match = $(el)
      .attr("href")
      ?.match(/page\/(\d+)/);
    if (match) maxPage = Math.max(maxPage, Number(match[1]));
  });

  return maxPage;
}

async function testHTMLOldest() {
  const lastPage = await getLastBlogPage();
  const results = [];

  for (let page = lastPage; page >= 1; page--) {
    const url = page === 1 ? BLOG_LIST_URL : `${BLOG_LIST_URL}page/${page}/`;

    console.log(`Scraping ${url}`);

    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const links = [];

    $("h3.entry-title > a").each((_, el) => {
      links.push({
        title: $(el).text().trim(),
        url: BASE_URL + $(el).attr("href"),
      });
    });

    // bottom → top = older → newer
    for (let i = links.length - 1; i >= 0; i--) {
      if (!results.find((r) => r.url === links[i].url)) {
        results.push(links[i]);
      }
      if (results.length === 5) break;
    }

    if (results.length === 5) break;
  }

  console.log("\n===== 🏆 TRUE OLDEST 5 BLOGS =====\n");
  results.forEach((r, i) => console.log(`${i + 1}. ${r.title}\n   ${r.url}\n`));
}

testHTMLOldest().catch(console.error);
