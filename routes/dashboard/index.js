const express = require("express");
const router = express.Router();

router.use("/team", require("./team"));
router.use("/scraper", require("./scraper"));
router.use("/sitemap", require("./sitemap"));

module.exports = router;
