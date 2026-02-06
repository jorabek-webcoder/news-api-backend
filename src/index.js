const express = require("express");
const { PORT, CORS_ORIGIN } = require("./utils/secret");
const { mainRouter } = require("./routes");
const { ConnectDB } = require("./utils/config.database");
const { errorMiddleware } = require("./middlewares/error.middleware");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { HttpException } = require("./utils/http-exception");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { initCronJobs } = require("./utils/cron-jobs");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./utils/swagger");

const app = express();

ConnectDB();

initCronJobs();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim());


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      console.log(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many requests. Please try again later.",
  },
});

app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static("public"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    docs: "/api-docs",
  });
});

mainRouter.forEach((rItem) => {
  app.use(rItem.path, rItem.rout);
});

app.use((req, res) => {
  throw new HttpException(
    StatusCodes.NOT_FOUND,
    `Route ${req.originalUrl} not found`,
  );
});

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    await mongoose.connection.close();
    console.log("MongoDb connection closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received");
  process.exit(0);
});
