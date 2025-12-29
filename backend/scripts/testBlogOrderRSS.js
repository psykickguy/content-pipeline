const axios = require("axios");
const xml2js = require("xml2js");

const FEED_URL = "https://beyondchats.com/feed/";

async function testBlogOrderRSS() {
  console.log("Fetching POSTS RSS feed...\n");

  const { data: xml } = await axios.get(FEED_URL, { timeout: 15000 });

  const parser = new xml2js.Parser({ explicitArray: true });
  const result = await parser.parseStringPromise(xml);

  const channel = result?.rss?.channel?.[0];
  if (!channel || !channel.item) {
    throw new Error("Post items not found in RSS feed");
  }

  const items = channel.item;

  console.log("===== BLOG TITLES FROM RSS (NEWEST → OLDEST) =====\n");

  items.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.title[0]} — ${new Date(
        item.pubDate[0]
      ).toDateString()}`
    );
  });

  console.log("\n===== OLDEST 5 BLOGS (FINAL ANSWER) =====\n");

  const oldestFive = items.slice(-5);

  oldestFive.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.title[0]}
   ${item.link[0]}
   ${new Date(item.pubDate[0]).toDateString()}\n`
    );
  });

  console.log("✅ RSS posts feed works perfectly");
}

testBlogOrderRSS().catch(console.error);
