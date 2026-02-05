const { AuthRouter } = require("./auth/auth.router");
const { NewsRouter } = require("./news/news.router");
const { UploadRouter } = require("./upload/upload.route");

const mainRouter = [
  { path: "/news", rout: NewsRouter },
  { path: "/upload", rout: UploadRouter },
  { path: "/auth", rout: AuthRouter },
];

module.exports = { mainRouter };
