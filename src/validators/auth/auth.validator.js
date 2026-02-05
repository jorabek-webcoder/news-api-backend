const { body, param, query } = require("express-validator");
const { RoleConstands } = require("../../utils/constands");

class AuthValidator {
  static signUpAdmin = () => [
    body("name", "Name is required").notEmpty(),
    body("name", "Name must be a string").isString(),
    body("email", "Email is required").notEmpty(),
    body("email", "Email must be a valid email address").isEmail(),
    body("password", "Password is required").notEmpty(),
    body("password", "Password must be strong").isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
    body("reg_key", "Registration key is required").notEmpty(),
    body("reg_key", "Registration key must be a string").isString(),
  ];

  static signUp = () => [
    body("name", "Name is required").notEmpty(),
    body("name", "Name must be a string").isString(),
    body("email", "Email is required").notEmpty(),
    body("email", "Email must be a valid email address").isEmail(),
    body("password", "Password is required").notEmpty(),
    body("password", "Password must be strong").isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  ];

  static login = () => [
    body("email", "Email is required").notEmpty(),
    body("email", "Email must be a valid email address").isEmail(),
    body("password", "Password is required").notEmpty(),
    body("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
  ];

  static getSingleUser = () => [
    param("id", "User ID is required").notEmpty(),
    param("id", "Invalid User ID").isMongoId(),
    query("page", "Page must be a positive integer")
      .optional()
      .isInt({ min: 1 }),
    query("limit", "Limit must be a positive integer")
      .optional()
      .isInt({ min: 1 }),
  ];

  static getAllUsers = () => [
    query("search", "Search must be a string").optional().isString(),
    query("page", "Page must be a positive integer")
      .optional()
      .isInt({ min: 1 }),
    query("limit", "Limit must be a positive integer")
      .optional()
      .isInt({ min: 1 }),
    query("role", "Role must be a string").optional().isString(),
    query("role", "Role must be either ADMIN or USER")
      .optional()
      .isIn([RoleConstands.ADMIN, RoleConstands.USER]),
  ];

  static updateMeProfileImg = () => [
    body("newProfileImg", "Profile image URL is required").notEmpty(),
    body("newProfileImg", "Profile image URL must be a string")
      .isString(),
  ];

  static updateMeEmail = () => [
    body("newEmail", "New email is required").notEmpty(),
    body("newEmail", "New email must be a valid email address").isEmail(),
  ];

  static updateMeName = () => [
    body("newName", "New name is required").notEmpty(),
    body("newName", "New name must be a string").isString(),
  ];

  static updateMePassword = () => [
    body("old_password", "Current password is required").notEmpty(),
    body(
      "old_password",
      "Current password must be at least 8 characters long",
    ).isLength({ min: 8 }),
    body("new_password", "New password is required").notEmpty(),
    body("new_password", "New password must be strong").isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
    body("confirm_password", "Confirm password is required").notEmpty(),
    body(
      "confirm_password",
      "Confirm password must be at least 8 characters long",
    ).isLength({ min: 8 }),
    body(
      "confirm_password",
      "New password and confirm password do not match",
    ).custom((value, { req }) => value === req.body.new_password),
  ];
}

module.exports = { AuthValidator };
