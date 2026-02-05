const { config } = require("dotenv");
config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;
const REG_KEY = process.env.REG_KEY;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = { PORT, MONGO_URI, REG_KEY, JWT_SECRET_KEY };
