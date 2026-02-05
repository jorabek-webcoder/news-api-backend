const { Schema, model } = require("mongoose");
const { CollectionName, FileTypes } = require("../../utils/constands");

const documentSchema = new Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    user: { type: Schema.Types.ObjectId, ref: CollectionName.AUTH },
    medias: [ 
      {
        file_path: { type: String, required: true },
        file_type: {
          type: String,
          required: true,
          enum: [FileTypes.IMAGE, FileTypes.VIDEO],
        },
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

const NewsModel = model(
  CollectionName.NEWS,
  documentSchema,
  CollectionName.NEWS,
);

module.exports = { NewsModel };
