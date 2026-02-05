const { body, param } = require("express-validator");

class NewsValidator {
  static add = () => [
    body("title", "Title is required").notEmpty(),
    body("title", "Title must be a string").isString(),
    body("title", "Title cannot be empty").trim().notEmpty(),
    body("desc", "Description is required").notEmpty(),
    body("desc", "Description must be a string").isString(),
    body("desc", "Description cannot be empty").trim().notEmpty(),
    body("medias", "Medias is required").notEmpty(),
    body("medias", "Medias must be an array").isArray({ min: 1 }),
    body("medias.*.file_path", "File path is required").notEmpty(),
    body("medias.*.file_path", "File path must be a string").isString(),
  ];

  static getSingle = () => [
    param("news_id", "News ID is required. ").notEmpty(),
    param("news_id", "News ID must be a string. ").isString(),
    param("news_id", "Invalid News ID. ").isMongoId(),
  ];

  static getAllOtherUser = () => [
    param("user_id", "User ID is required. ").notEmpty(),
    param("user_id", "User ID must be a string. ").isString(),
    param("user_id", "Invalid User ID. ").isMongoId(),
  ];

  static update = () => [
    param("news_id", "News ID is required. ").notEmpty(),
    param("news_id", "News ID must be a string. ").isString(),
    param("news_id", "Invalid News ID. ").isMongoId(),
    body("title", "Title must be a string. ").optional().isString(),
    body("title", "Title must be a empty string. ").optional().trim().notEmpty().escape(),
    body("desc", "Desc must be a string. ").optional().isString(),
    body("desc", "Desc must be a empty string. ").optional().trim().notEmpty().escape(),
  ];
}

module.exports = { NewsValidator };
