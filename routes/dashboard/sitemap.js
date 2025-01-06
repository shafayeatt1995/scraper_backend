const express = require("express");
const router = express.Router();
const { Team, User, Sitemap } = require("../../models");
const {
  parseError,
  objectID,
  sendError,
  paginate,
  checkTeam,
} = require("../../utils");
const XLSX = require("xlsx");
const fs = require("fs");

router.get("/", async (req, res) => {
  try {
    const { _id } = req.user;
    const { page, perPage, teamID } = req.query;
    const user = await User.findOne({ _id });
    if (user) {
      const team = await Team.findOne({
        _id: teamID,
        ...checkTeam(user._id),
      });
      if (!team) return sendError({ message: "You don't have access" });
      const items = await Sitemap.aggregate([
        {
          $match: {
            userID: objectID(_id),
            teamID: objectID(teamID),
          },
        },
        {
          $sort: { _id: -1 },
        },
        ...paginate(page, perPage),
        {
          $addFields: {
            resultCount: { $size: "$result" },
          },
        },
        { $project: { name: 1, status: 1, urls: 1, resultCount: 1 } },
      ]);
      return res.json({ items });
    }
    return sendError({ message: "You don't have access" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const user = await User.findOne({ _id });
    if (!user) return sendError({ message: "You don't have access" });
    const sitemap = await Sitemap.findOne({ _id: id });
    if (!sitemap) return sendError({ message: "Sitemap not found" });
    const team = await Team.findOne({
      _id: sitemap.teamID,
      ...checkTeam(user._id),
    });
    if (!team) return sendError({ message: "You don't have access" });
    await Sitemap.deleteOne({ _id: id });
    return res.json({ message: "Sitemap deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});
router.get("/download", async (req, res) => {
  try {
    const { _id: userID } = req.user;
    const { _id } = req.query;
    const user = await User.findOne({ _id: userID });
    if (!user)
      return res.status(403).json({ message: "You don't have access" });

    const sitemap = await Sitemap.findOne({ _id });
    if (!sitemap) return res.status(404).json({ message: "Sitemap not found" });

    const team = await Team.findOne({
      _id: sitemap.teamID,
      ...checkTeam(userID),
    });
    if (!team) return sendError({ message: "You don't have access" });

    const results = sitemap.result || [];
    const headers = ["Serial", "URL"];

    const formattedData = Array.isArray(results)
      ? results.map((url, i) => [i + 1, url])
      : [];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...formattedData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sitemap Results");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${sitemap.name || "sitemap"}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json(parseError(error));
  }
});

module.exports = router;
