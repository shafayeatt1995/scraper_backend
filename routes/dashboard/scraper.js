const express = require("express");
const { validation } = require("../../validation");
const { Team, Sitemap } = require("../../models");
const { parseError, urlDetails, checkTeam } = require("../../utils");
const { sitemapValidation } = require("../../validation/scraper");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const router = express.Router();

router.post("/sitemap", sitemapValidation, validation, async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, urls, teamID } = req.body;
    await Sitemap.create({
      userID: _id,
      teamID,
      name,
      urls,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.post("/sitemap-url", async (req, res) => {
  try {
    const { _id: userID } = req.user;
    const { _id } = req.body;
    const sitemap = await Sitemap.findOne({ _id });
    if (!sitemap)
      return res
        .status(404)
        .json({ success: false, message: "Sitemap not found" });

    const team = await Team.findOne({
      _id: sitemap.teamID,
      ...checkTeam(userID),
    });

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "You don't have access" });

    await Sitemap.updateOne(
      { _id: sitemap._id },
      {
        $set: {
          status: "running",
        },
      }
    );

    res.json({ success: true, message: "Scraping started." });

    process.nextTick(async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const results = [];

      for (let url of sitemap.urls) {
        try {
          await page.goto(url, { waitUntil: "networkidle2" });
          const content = await page.content();
          const $ = cheerio.load(content);
          const htmlUrls =
            $("a")
              .map((i, el) => $(el).attr("href"))
              .get()
              .filter((url) => url && !url.startsWith("#")) || [];
          const xmlUrls =
            content
              .match(/<loc>(.*?)<\/loc>/g)
              ?.map((loc) => loc.replace(/<\/?loc>/g, "")) || [];
          const allUrls = [...htmlUrls, ...xmlUrls];
          results.push(
            ...[...new Set(allUrls)].filter((u) => {
              const ud = urlDetails(u);
              const urlD = urlDetails(url);
              return ud === null || urlD === null
                ? false
                : ud?.hostname === urlD?.hostname;
            })
          );
        } catch (err) {
          console.error(`Error scraping sitemap: ${url}`, err);
        }
      }
      const uniqueUrls = [...new Set(results)];
      await Sitemap.updateOne(
        { _id: sitemap._id },
        {
          $set: {
            result: uniqueUrls,
            status: "complete",
          },
        }
      );
      await browser.close();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;
