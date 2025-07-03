const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/api/oglasi", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.willhaben.at/iad/gebrauchtwagen/auto/gebrauchtwagenboerse?PRICE_TO=15000&YEAR_MODEL_FROM=1990&YEAR_MODEL_TO=2025",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    const $ = cheerio.load(response.data);
    const oglasi = [];

    $("article[data-testid='search-result-entry']").each((_, el) => {
      const naslov = $(el).find("h2, h3").first().text().trim();
      const cijena = $(el).find("span[class*=Text]").first().text().trim();
      const link = $(el).find("a").attr("href");
      oglasi.push({
        naslov,
        cijena,
        opis: "",
        link: link ? `https://www.willhaben.at${link}` : "",
      });
    });

    res.json(oglasi.filter(o => o.naslov && o.cijena));
  } catch (err) {
    console.error("❌ Greška u scrapanju:", err.message);
    res.status(500).json({ error: "Greška u scrapanju podataka" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server pokrenut na http://localhost:${PORT}`);
});
