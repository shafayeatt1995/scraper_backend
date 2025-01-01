const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();

router.use("/auth", require("./auth"));

router.use(isAuthenticated);
router.use("/user", require("./user"));
router.use("/dashboard", require("./dashboard"));

module.exports = router;
