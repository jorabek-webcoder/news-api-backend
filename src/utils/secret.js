const { config } = require("dotenv");
config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const REG_KEY = process.env.REG_KEY;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

module.exports = { PORT, MONGO_URI, REG_KEY, JWT_SECRET_KEY, CORS_ORIGIN };
