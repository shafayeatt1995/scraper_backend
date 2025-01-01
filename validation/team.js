const { check } = require("express-validator");

const validate = {
  teamValidation: [
    check("name")
      .isLength({ min: 1, max: 20 })
      .withMessage("Name must be 1-20 characters long"),
  ],
};

module.exports = validate;
