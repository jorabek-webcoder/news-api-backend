/**
 * CRON JOBS - Scheduled tasks
 *
 * CRON TIME FORMAT:
 * minute (0-59)
 * hour (0-23)
 * day of month (1-31)
 * month (1-12)
 * day of week (0-7, 0 and 7 = Sunday)
 *
 * EXAMPLES:
 * "0 0 * * *"     - Every day at 00:00
 * "0 3 * * *"     - Every day at 03:00
 * "0 0 * * 0"     - Every Sunday at 00:00
 * "0 0 1 * *"     - First day of every month at 00:00
 */

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { UploadModel } = require("../models/upload/upload.model");

/**
 * Clean unused files
 * Runs every day at 03:00
 */
const cleanUnusedFiles = () => {
  cron.schedule("0 3 * * *", async () => {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const unusedFiles = await UploadModel.find({
        is_use: false,
        createdAt: { $lt: oneDayAgo },
      });

      for (const file of unusedFiles) {
        try {
          const filePath = path.join("./public", file.file_path);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          await UploadModel.findByIdAndDelete(file._id);
        } catch (fileError) {
          console.error("File cleanup error:", fileError.message);
        }
      }
    } catch (error) {
      console.error("Cron job error:", error.message);
    }
  });
};

/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
  cleanUnusedFiles();
};

module.exports = { initCronJobs };
