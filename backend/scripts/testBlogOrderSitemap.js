const axios = require("axios");
const cheerio = require("cheerio");

const SITEMAP_INDEX = "https://beyondchats.com/wp-sitemap.xml";

async function fetchAllPostUrlsFromSitemap() {
  console.log("📦 Fetching sitemap index...\n");

  const { data: indexXml } = await axios.get(SITEMAP_INDEX, { timeout: 15000 });
  const $index = cheerio.load(indexXml, { xmlMode: true });

  // Only post sitemaps
  const postSitemaps = [];
  $index("sitemap > loc").each((_, el) => {
    const loc = $index(el).text();
    if (loc.includes("wp-sitemap-posts-post-")) {
      postSitemaps.push(loc);
    }
  });

  console.log(`Found ${postSitemaps.length} post sitemaps\n`);

  const allPosts = [];

  for (const sitemapUrl of postSitemaps) {
    console.log(`Fetching ${sitemapUrl}`);

    const { data: xml } = await axios.get(sitemapUrl, { timeout: 15000 });
    const $ = cheerio.load(xml, { xmlMode: true });

    $("url").each((_, el) => {
      allPosts.push({
        url: $(el).find("loc").text(),
        lastmod: new Date($(el).find("lastmod").text()),
      });
    });
  }

  return allPosts;
}

async function testSitemapOldest() {
  const posts = await fetchAllPostUrlsFromSitemap();

  console.log(`\nTotal posts found: ${posts.length}\n`);

  posts.sort((a, b) => a.lastmod - b.lastmod);

  console.log("===== 🏆 TRUE OLDEST 5 BLOGS =====\n");

  posts.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.url}\n   ${p.lastmod.toDateString()}\n`);
  });
}

testSitemapOldest().catch(console.error);
