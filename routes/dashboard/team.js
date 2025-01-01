const express = require("express");
const { teamValidation } = require("../../validation/team");
const { validation } = require("../../validation");
const { Team } = require("../../models");
const { parseError } = require("../../utils");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { _id } = req.user;
    const items = await Team.find({
      $or: [{ adminID: _id }, { memberIDs: { $in: [_id] } }],
    });
    res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.post("/", teamValidation, validation, async (req, res) => {
  try {
    const { _id } = req.user;
    const { name } = req.body;
    await Team.create({ name, adminID: _id });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;
