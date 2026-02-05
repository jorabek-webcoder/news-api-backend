const { StatusCodes } = require("http-status-codes");
const { asyncHandler } = require("../../utils/async-handler");
const { HttpException } = require("../../utils/http-exception");
const { UploadModel } = require("../../models/upload/upload.model");
const { AuthModel } = require("../../models/auth/auth.model");

class UploadController {
  static uploadFile = asyncHandler(async (req, res) => {
    const { filename, mimetype } = req.file;
    const { user_id } = req.user;

    if (!filename) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "File not uploaded");
    }

    const user = await AuthModel.findById(user_id).select("-password -profile_image -news -createdAt -updatedAt");

    const upload = {};

    if (mimetype.startsWith("image/")) {
      upload.file_type = "image";
      upload.file_path = "/uploads/images/" + filename;
    } else if (mimetype.startsWith("video/")) {
      upload.file_type = "video";
      upload.file_path = "/uploads/videos/" + filename;
    }

    if (!upload.file_type || !upload.file_path) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "file not uploaded");
    }

    await UploadModel.create({
      file_path: upload.file_path,
      file_type: upload.file_type,
      user,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      file: upload,
    });
  });

  static uploadFiles = asyncHandler(async (req, res) => {
    const { user_id } = req.user;

    if (!req.files || req.files.length === 0) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Files not found");
    }

    const user = await AuthModel.findById(user_id).select("-password -profile_image -news -createdAt -updatedAt");

    const uploadedFiles = [];
    const failedFiles = [];

    for (const file of req.files) {
      const { filename, mimetype } = file;
      let file_type = "";
      let file_path = "";

      if (mimetype.startsWith("image/")) {
        file_type = "image";
        file_path = "/uploads/images/" + filename;
      } else if (mimetype.startsWith("video/")) {
        file_type = "video";
        file_path = "/uploads/videos/" + filename;
      }

      if (!file_type || !file_path) {
        failedFiles.push({ filename });
        continue;
      }

      await UploadModel.create({
        file_path,
        file_type,
        user,
      });

      uploadedFiles.push({ file_path, file_type });
    }

    if (uploadedFiles.length === 0) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "files not uploaded");
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      files: uploadedFiles,
      failed: failedFiles,
    });
  });
}

module.exports = { UploadController };
