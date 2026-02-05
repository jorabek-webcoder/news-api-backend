const { StatusCodes } = require("http-status-codes");
const { NewsModel } = require("../../models/news/news.model");
const { asyncHandler } = require("../../utils/async-handler");
const { HttpException } = require("../../utils/http-exception");
const { UploadModel } = require("../../models/upload/upload.model");
const { AuthModel } = require("../../models/auth/auth.model");

class NewsController {
  static getAll = asyncHandler(async (req, res) => {
    const { search, limit, page } = req.query;

    let searchQuery = {};
    if (search && search.trim().length) {
      searchQuery = {
        $or: [
          { title: { $regex: search.trim(), $options: "i" } },
          { desc: { $regex: search.trim(), $options: "i" } },
        ],
      };
    }

    const NewsData = await NewsModel.find(searchQuery)
      .limit(parseInt(limit) || 0)
      .skip(((parseInt(page) || 1) - 1) * (parseInt(limit) || 0));

    const totalCount = await NewsModel.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: NewsData,
      pagination: {
        total: NewsData.length,
        totalCount,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || null,
        nextPage:
          (parseInt(page) || 1) * (parseInt(limit) || NewsData.length) <
          totalCount
            ? true
            : false,
        prevPage: (parseInt(page) || 1) > 1 ? true : false,
      },
    });
  });

  static getSingle = asyncHandler(async (req, res) => {
    const { news_id } = req.params;

    const newsItem = await NewsModel.findById(news_id).populate({
      path: "user",
      select: ["name", "email", "profile_image"],
    });

    if (!newsItem) {
      throw new HttpException(StatusCodes.NOT_FOUND, "News not found");
    }

    res.status(200).json({
      success: true,
      data: newsItem,
    });
  });

  static getAllOtherUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const newsData = await NewsModel.find({ user: user_id })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const totalCount = await NewsModel.countDocuments({ user: user_id });

    res.status(StatusCodes.OK).json({
      success: true,
      data: newsData,
      pagination: {
        total: newsData.length,
        totalCount,
        page: Number(page),
        limit: Number(limit),
        next: Number(page) * Number(limit) < totalCount ? true : false,
        prev: Number(page) > 1 ? true : false,
      },
    });
  });

  static getAllMe = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const { page = 1, limit = 5 } = req.query;

    const newsData = await NewsModel.find({ user: user_id })
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const totalCount = await NewsModel.countDocuments({ user: user_id });

    res.status(StatusCodes.OK).json({
      success: true,
      data: newsData,
      pagination: {
        total: newsData.length,
        totalCount,
        page: Number(page),
        limit: Number(limit),
        next: Number(page) * Number(limit) < totalCount ? true : false,
        prev: Number(page) > 1 ? true : false,
      },
    });
  });

  static add = asyncHandler(async (req, res) => {
    const { title, desc, medias } = req.body;
    const { user_id } = req.user;

    const failedFiles = [];
    const usedFiles = [];

    for (let i = 0; i < medias.length; i++) {
      const { file_path } = medias[i];

      const fileItem = await UploadModel.findOne({ file_path });

      if (fileItem) {
        await UploadModel.findByIdAndUpdate(fileItem._id, { is_use: true });
        usedFiles.push({ file_path, file_type: fileItem.file_type });
      } else {
        failedFiles.push({ file_path });
      }
    }

    if (usedFiles.length === 0) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "No valid media files provided",
      );
    }

    await NewsModel.create({
      title: title.trim(),
      desc: desc.trim(),
      medias: usedFiles,
      user: user_id,
    });

    await AuthModel.updateOne(
      { _id: user_id },
      { $push: { news: usedFiles.map((file) => file._id) } },
    );

    res
      .status(201)
      .json({ success: true, message: "News add successfuly", failedFiles });
  });

  static delete = asyncHandler(async (req, res) => {
    const { news_id } = req.params;
    const { user_id } = req.user;

    const newsItem = await NewsModel.findById(news_id);

    if (!newsItem) {
      throw new HttpException(StatusCodes.NOT_FOUND, "News not found");
    }

    const requestingUser = await AuthModel.findById(user_id);

    if (newsItem.user.toString() !== requestingUser._id.toString()) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to delete this news",
      );
    }

    await NewsModel.findByIdAndDelete(news_id);

    await UploadModel.updateOne(
      { _id: { $in: newsItem.medias.map((media) => media._id) } },
      { is_use: false },
      { multi: true },
    );

    await AuthModel.findByIdAndUpdate(user_id, {
      $pull: { news: news_id },
    });

    res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });
  });

  static update = asyncHandler(async (req, res) => {
    const { news_id } = req.params;
    const { title, desc } = req.body;
    const { user_id } = req.user;

    const newsItem = await NewsModel.findById(news_id);

    if (!newsItem) {
      throw new HttpException(StatusCodes.NOT_FOUND, "News not found");
    }

    const requestingUser = await AuthModel.findById(user_id);

    if (newsItem.user.toString() !== requestingUser._id.toString()) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not allowed to update this news",
      );
    }

    if (
      (title === undefined && desc === undefined) ||
      (title.trim().length === 0 && desc.trim().length === 0)
    ) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "No valid fields provided for update",
      );
    }

    if (title === newsItem.title && desc === newsItem.desc) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "No changes detected in the provided fields",
      );
    }

    newsItem.title = title ? title.trim() : newsItem.title;
    newsItem.desc = desc ? desc.trim() : newsItem.desc;

    await newsItem.save();

    res.status(200).json({
      success: true,
      message: "News updated successfully",
    });
  });
}

module.exports = { NewsController };
