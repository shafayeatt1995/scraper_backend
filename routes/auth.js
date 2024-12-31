const express = require("express");
const router = express.Router();

const {
  login,
  socialLogin,
  refreshToken,
  getUser,
} = require("../controllers/AuthController");
const { loginValidation } = require("../validation/auth");
const { validation } = require("../validation");
const passport = require("passport");
const isAuthenticated = require("../middleware/isAuthenticated");
require("../config/passport");
const data = { error: true };

router.use(passport.initialize());
router.use(passport.session());

router.get("/logout", (req, res) => res.json({ user: null }));
router.post("/login", loginValidation, validation, login);
router.post("/refresh-token", refreshToken);
router.get(
  "/social-login/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/social-login/google/callback",
  passport.authenticate("google", {
    failureRedirect: `/social-login?e=${btoa(JSON.stringify(data))}`,
  }),
  socialLogin
);

router.use(isAuthenticated);
router.get("/user", getUser);

module.exports = router;
