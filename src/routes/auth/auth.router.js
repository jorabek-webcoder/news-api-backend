const { Router } = require("express");
const { AuthController } = require("../../controllers/auth/auth.controller");
const { AuthValidator } = require("../../validators/auth/auth.validator");
const { expressValidate } = require("../../validators");
const { AuthMiddleware } = require("../../middlewares/auth.middleware");

const AuthRouter = Router();

/**
 * @swagger
 * /auth/signup-admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, reg_key]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin User
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               reg_key:
 *                 type: string
 *                 example: your-registration-key
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       403:
 *         description: Invalid registration key
 *       409:
 *         description: Email already exists
 */
AuthRouter.post(
  "/signup-admin",
  AuthValidator.signUpAdmin(),
  expressValidate,
  AuthController.signUpAdmin,
);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */
AuthRouter.post(
  "/signup",
  AuthValidator.signUp(),
  expressValidate,
  AuthController.signUp,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 */
AuthRouter.post(
  "/login",
  AuthValidator.login(),
  expressValidate,
  AuthController.login,
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
AuthRouter.get("/me", AuthMiddleware, AuthController.me);

/**
 * @swagger
 * /auth/get-single-user/{id}:
 *   get:
 *     summary: Get single user by ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: User data
 *       404:
 *         description: User not found
 */
AuthRouter.get(
  "/get-single-user/:id",
  AuthMiddleware,
  AuthValidator.getSingleUser(),
  expressValidate,
  AuthController.getSingleUser,
);

/**
 * @swagger
 * /auth/get-all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Auth]
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
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of users with pagination
 *       403:
 *         description: Forbidden - Admin only
 */
AuthRouter.get(
  "/get-all-users",
  AuthMiddleware,
  AuthValidator.getAllUsers(),
  expressValidate,
  AuthController.getAllUsers,
);

/**
 * @swagger
 * /auth/update-me-profile-img:
 *   patch:
 *     summary: Update profile image
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newProfileImg]
 *             properties:
 *               newProfileImg:
 *                 type: string
 *                 example: /uploads/images/abc.jpg
 *     responses:
 *       200:
 *         description: Profile image updated
 *       404:
 *         description: Image not found
 */
AuthRouter.patch(
  "/update-me-profile-img",
  AuthMiddleware,
  AuthValidator.updateMeProfileImg(),
  expressValidate,
  AuthController.updateMeProfileImg,
);

/**
 * @swagger
 * /auth/update-me-email:
 *   patch:
 *     summary: Update email
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newEmail]
 *             properties:
 *               newEmail:
 *                 type: string
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: Email updated
 *       409:
 *         description: Email already exists
 */
AuthRouter.patch(
  "/update-me-email",
  AuthMiddleware,
  AuthValidator.updateMeEmail(),
  expressValidate,
  AuthController.updateMeEmail,
);

/**
 * @swagger
 * /auth/update-me-name:
 *   patch:
 *     summary: Update name
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newName]
 *             properties:
 *               newName:
 *                 type: string
 *                 example: New Name
 *     responses:
 *       200:
 *         description: Name updated
 */
AuthRouter.patch(
  "/update-me-name",
  AuthMiddleware,
  AuthValidator.updateMeName(),
  expressValidate,
  AuthController.updateMeName,
);

/**
 * @swagger
 * /auth/update-me-password:
 *   patch:
 *     summary: Update password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [old_password, new_password, confirm_password]
 *             properties:
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Passwords don't match
 *       401:
 *         description: Current password incorrect
 */
AuthRouter.patch(
  "/update-me-password",
  AuthMiddleware,
  AuthValidator.updateMePassword(),
  expressValidate,
  AuthController.updateMePassword,
);

module.exports = { AuthRouter };
