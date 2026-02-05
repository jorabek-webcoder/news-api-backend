const { Router } = require("express");
const { uploadFile, checkFileSize } = require("../../utils/file-upload");
const {
  UploadController,
} = require("../../controllers/upload/upload.controller");
const { AuthMiddleware } = require("../../middlewares/auth.middleware");

const UploadRouter = Router();

/**
 * @swagger
 * /upload/file:
 *   post:
 *     summary: Upload single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 file:
 *                   $ref: '#/components/schemas/Upload'
 *       400:
 *         description: File size exceeded or invalid file type
 */
UploadRouter.post(
  "/file",
  AuthMiddleware,
  uploadFile.single("file"),
  checkFileSize,
  UploadController.uploadFile,
);

/**
 * @swagger
 * /upload/files:
 *   post:
 *     summary: Upload multiple files (max 5)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Upload'
 *                 failed:
 *                   type: array
 *       400:
 *         description: No files or invalid files
 */
UploadRouter.post(
  "/files",
  AuthMiddleware,
  uploadFile.array("files", 5),
  checkFileSize,
  UploadController.uploadFiles,
);

module.exports = { UploadRouter };
