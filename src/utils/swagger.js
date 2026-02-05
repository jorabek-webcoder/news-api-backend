const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "News API",
      version: "1.0.0",
      description: "A simple news API with user authentication",
    },
    servers: [
      {
        url: "http://localhost:8989",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["admin", "user"], example: "user" },
            profile_image: { type: "string", example: "/uploads/images/abc.jpg" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        News: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            title: { type: "string", example: "Breaking News" },
            desc: { type: "string", example: "News description here..." },
            medias: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  file_path: { type: "string", example: "/uploads/images/news.jpg" },
                  file_type: { type: "string", enum: ["image", "video"] },
                },
              },
            },
            user: { type: "string", example: "507f1f77bcf86cd799439011" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Upload: {
          type: "object",
          properties: {
            file_path: { type: "string", example: "/uploads/images/abc.jpg" },
            file_type: { type: "string", enum: ["image", "video"] },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            msg: { type: "string", example: "Error message" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer", example: 100 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 10 },
            hasNextPage: { type: "boolean", example: true },
            hasPrevPage: { type: "boolean", example: false },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "News", description: "News management endpoints" },
      { name: "Upload", description: "File upload endpoints" },
    ],
  },
  apis: ["./src/routes/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
