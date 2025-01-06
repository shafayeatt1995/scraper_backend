const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SitemapSchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, required: true },
    teamID: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    urls: { type: [String], required: true },
    result: { type: [String], default: [] },
    status: { type: String, default: "pending" },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Sitemap", SitemapSchema);
