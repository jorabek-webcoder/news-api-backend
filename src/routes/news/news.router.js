const { Router } = require("express");
const { NewsController } = require("../../controllers/news/news.controller");
const { expressValidate } = require("../../validators");
const { NewsValidator } = require("../../validators/news/news.validator");
const { AuthMiddleware } = require("../../middlewares/auth.middleware");

const NewsRouter = Router();

/**
 * @swagger
 * /news/get-all:
 *   get:
 *     summary: Get all news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of news with pagination
 */
NewsRouter.get("/get-all", AuthMiddleware, NewsController.getAll);

/**
 * @swagger
 * /news/get-single/{news_id}:
 *   get:
 *     summary: Get single news by ID
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: news_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News data with user info
 *       404:
 *         description: News not found
 */
NewsRouter.get(
  "/get-single/:news_id",
  AuthMiddleware,
  NewsValidator.getSingle(),
  expressValidate,
  NewsController.getSingle,
);

/**
 * @swagger
 * /news/get-all-other-user/{user_id}:
 *   get:
 *     summary: Get all news by user ID
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: User's news with pagination
 */
NewsRouter.get(
  "/get-all-other-user/:user_id",
  AuthMiddleware,
  NewsValidator.getAllOtherUser(),
  expressValidate,
  NewsController.getAllOtherUser,
);

/**
 * @swagger
 * /news/get-all-me:
 *   get:
 *     summary: Get current user's news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: My news with pagination
 */
NewsRouter.get("/get-all-me", AuthMiddleware, NewsController.getAllMe);

/**
 * @swagger
 * /news/add:
 *   post:
 *     summary: Create new news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, desc, medias]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Breaking News
 *               desc:
 *                 type: string
 *                 example: News description here
 *               medias:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     file_path:
 *                       type: string
 *                       example: /uploads/images/abc.jpg
 *     responses:
 *       201:
 *         description: News created successfully
 *       400:
 *         description: No valid media files
 */
NewsRouter.post(
  "/add",
  AuthMiddleware,
  NewsValidator.add(),
  expressValidate,
  NewsController.add,
);

/**
 * @swagger
 * /news/delete/{news_id}:
 *   delete:
 *     summary: Delete news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: news_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News deleted successfully
 *       403:
 *         description: Not authorized to delete
 *       404:
 *         description: News not found
 */
NewsRouter.delete(
  "/delete/:news_id",
  AuthMiddleware,
  NewsValidator.getSingle(),
  expressValidate,
  NewsController.delete,
);

/**
 * @swagger
 * /news/update/{news_id}:
 *   patch:
 *     summary: Update news
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: news_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *     responses:
 *       200:
 *         description: News updated successfully
 *       403:
 *         description: Not authorized to update
 *       404:
 *         description: News not found
 */
NewsRouter.patch(
  "/update/:news_id",
  AuthMiddleware,
  NewsValidator.update(),
  expressValidate,
  NewsController.update,
);

module.exports = { NewsRouter };
