const axios = require("axios");
const cheerio = require("cheerio");

(async () => {
  const { data: html } = await axios.get(
    "https://beyondchats.com/blogs/page/15/",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/121.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 15000,
    }
  );

  console.log("HTML length:", html.length);

  const $ = cheerio.load(html);

  console.log("\n--- DEBUG: Blog title candidates ---\n");

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr("href");

    if (href?.startsWith("/blogs/") && text.length > 20) {
      console.log("TEXT:", text);
      console.log("HREF:", href);
      console.log(
        "PARENT:",
        $(el).parent().prop("tagName"),
        $(el).parent().attr("class")
      );
      console.log("-----");
    }
  });
})();
