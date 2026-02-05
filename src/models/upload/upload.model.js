const { Schema, model } = require("mongoose");
const { CollectionName, FileTypes } = require("../../utils/constands");

const documentSchema = new Schema(
  {
    file_path: { type: String, required: true },
    file_type: {
      type: String,
      enum: [FileTypes.IMAGE, FileTypes.VIDEO],
      required: true,
    },
    is_use: { type: Boolean, default: false },
    user: { type: Object, required: true },
  },
  { timestamps: true, versionKey: false },
);

const UploadModel = model(
  CollectionName.UPLOAD,
  documentSchema,
  CollectionName.UPLOAD,
);

module.exports = { UploadModel };
