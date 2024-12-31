const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();

router.use("/auth", require("./auth"));

router.use(isAuthenticated);
router.use("/user", require("./user"));

module.exports = router;
