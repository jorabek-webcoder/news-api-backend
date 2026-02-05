const { StatusCodes } = require("http-status-codes");
const { HttpException } = require("../utils/http-exception");
const { verify } = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../utils/secret");

const AuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, "No token provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, "No token provided");
  }

  try {
    const decoded = verify(token, JWT_SECRET_KEY);
    req.user = { user_id: decoded.user_id };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Token expired. Please login again");
    }
    if (error.name === "JsonWebTokenError") {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Invalid token");
    }
    throw new HttpException(StatusCodes.UNAUTHORIZED, "Authentication failed");
  }
};

module.exports = { AuthMiddleware };
