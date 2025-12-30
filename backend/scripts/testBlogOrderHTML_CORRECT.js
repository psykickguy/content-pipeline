const axios = require("axios");
const cheerio = require("cheerio");

const BLOG_LIST_URL = "https://beyondchats.com/blogs/";

async function getLastBlogPage() {
  const { data } = await axios.get(BLOG_LIST_URL);
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

async function getTrueOldestFive() {
  const lastPage = await getLastBlogPage();
  const posts = [];

  for (let page = 1; page <= lastPage; page++) {
    const url = page === 1 ? BLOG_LIST_URL : `${BLOG_LIST_URL}page/${page}/`;
    console.log("Scraping:", url);

    const { data } = await axios.get(url);
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

  // ✅ sort by REAL publish date
  posts.sort((a, b) => a.date - b.date);

  console.log("\n===== 🏆 TRUE OLDEST 5 BLOGS =====\n");

  posts.slice(0, 5).forEach((p, i) => {
    console.log(
      `${i + 1}. ${p.title}\n   ${p.link}\n   ${p.date.toDateString()}\n`
    );
  });
}

getTrueOldestFive().catch(console.error);
