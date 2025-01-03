const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new Schema(
  {
    name: { type: String, required: true },
    adminsID: { type: [Schema.Types.ObjectId], required: true },
    membersID: { type: [Schema.Types.ObjectId], default: [] },
  },
  {
    strict: true,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Team", TeamSchema);
