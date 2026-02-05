const { connect } = require("mongoose");
const { MONGO_URI } = require("./secret");

const ConnectDB = async () => {
  try {
    await connect(MONGO_URI);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { ConnectDB };
