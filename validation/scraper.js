const { check } = require("express-validator");
const { User, Team } = require("../models");
const { checkTeam } = require("../utils");

const validate = {
  sitemapValidation: [
    check("name")
      .isLength({ min: 1, max: 50 })
      .withMessage("Name must be 1-50 characters long")
      .custom(async (value, { req }) => {
        const { _id } = req.user;
        const { teamID } = req.body;
        const user = await User.findOne({ _id });
        if (user) {
          const team = await Team.findOne({
            _id: teamID,
            ...checkTeam(user._id),
          });
          if (team) {
            return true;
          } else {
            throw new Error(`You don't have access`);
          }
        } else {
          throw new Error(`You don't have access`);
        }
      }),
    check("urls").custom(async (value) => {
      console.log(value.length === 0);
      if (!Array.isArray(value))
        throw new Error("urls must be an array of strings");
      if (value.length === 0) throw new Error("urls can't be empty");
      const invalidUrls = value.filter((url) => {
        try {
          new URL(url);
          return false;
        } catch {
          return true;
        }
      });
      if (invalidUrls.length)
        throw new Error(
          `Invalid URL${invalidUrls.length > 1 ? "s" : ""}: ${invalidUrls.join(
            ", "
          )}`
        );
      return true;
    }),
  ],
};

module.exports = validate;
