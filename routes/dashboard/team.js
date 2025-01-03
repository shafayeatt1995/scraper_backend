const express = require("express");
const { teamValidation } = require("../../validation/team");
const { validation } = require("../../validation");
const { Team, User } = require("../../models");
const { parseError, objectID } = require("../../utils");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { _id } = req.user;
    const items = await Team.find({
      $or: [{ adminsID: { $in: [_id] } }, { membersID: { $in: [_id] } }],
    });
    res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.get("/full", async (req, res) => {
  try {
    const { _id } = req.user;
    const { teamID } = req.query;
    const [items] = await Team.aggregate([
      {
        $match: {
          _id: objectID(teamID),
          $or: [
            { adminsID: { $in: [objectID(_id)] } },
            { memberIDs: { $in: [objectID(_id)] } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "adminsID",
          foreignField: "_id",
          as: "admins",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "membersID",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $project: {
          name: 1,
          members: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
          admins: {
            _id: 1,
            name: 1,
            avatar: 1,
          },
        },
      },
    ]);
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
    await Team.create({ name, adminsID: [_id] });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.post("/add-user", async (req, res) => {
  try {
    const { _id } = req.user;
    const { email } = req.body;
    const user = await User.findOne({ email });
    await Team.updateOne(
      { adminsID: { $in: [_id] } },
      { $addToSet: { membersID: user._id } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.post("/make-admin", async (req, res) => {
  try {
    const { _id } = req.user;
    const { teamID, userID } = req.body;
    const user = await User.findOne({ _id: userID });
    await Team.updateOne(
      { _id: teamID, adminsID: { $in: [_id] } },
      {
        $pull: { membersID: userID },
        $addToSet: { adminsID: userID },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.post("/remove-user", async (req, res) => {
  try {
    const { _id } = req.user;
    const { teamID, userID } = req.body;
    await Team.updateOne(
      { _id: teamID, adminsID: { $in: [_id] } },
      {
        $pull: { membersID: userID },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;
