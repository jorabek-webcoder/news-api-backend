const { Schema, model } = require("mongoose");
const { CollectionName, RoleConstands } = require("../../utils/constands");

const documentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profile_image: { type: String, default: "" },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: [RoleConstands.ADMIN, RoleConstands.USER],
      default: RoleConstands.USER,
    },
    news: [{ type: Schema.Types.ObjectId, ref: CollectionName.NEWS }],
  },
  { timestamps: true, versionKey: false },
);

const AuthModel = model(
  CollectionName.AUTH,
  documentSchema,
  CollectionName.AUTH,
);

module.exports = { AuthModel };
