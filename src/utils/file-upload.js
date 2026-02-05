const multer = require("multer");
const path = require("path");
const { HttpException } = require("./http-exception");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

// Maksimal hajmlar (baytda)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "./public/uploads/images");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "./public/uploads/videos");
    } else {
      cb(new HttpException(StatusCodes.UNSUPPORTED_MEDIA_TYPE, "Only images and videos are allowed"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueFileName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new HttpException(StatusCodes.UNSUPPORTED_MEDIA_TYPE, "Only images and videos are allowed"));
  }
};

// Asosiy multer konfiguratsiyasi
const uploadFile = multer({
  storage,
  limits: { 
    fileSize: MAX_VIDEO_SIZE  // Eng katta hajm (video)
  },
  fileFilter,
});

const checkFileSize = (req, res, next) => {
  const fs = require("fs");
  
  if (req.file) {
    const { mimetype, size } = req.file;
    
    if (mimetype.startsWith("image/") && size > MAX_IMAGE_SIZE) {
      fs.unlinkSync(req.file.path);
      throw new HttpException(StatusCodes.BAD_REQUEST, `Image size must not exceed ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    }
    
    if (mimetype.startsWith("video/") && size > MAX_VIDEO_SIZE) {
      fs.unlinkSync(req.file.path);
      throw new HttpException(StatusCodes.BAD_REQUEST, `Video size must not exceed ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    }
  }
  
  if (req.files && req.files.length > 0) {
    const invalidFiles = [];
    
    for (const file of req.files) {
      const { mimetype, size } = file;
      
      if (mimetype.startsWith("image/") && size > MAX_IMAGE_SIZE) {
        invalidFiles.push({ file, reason: `Image size exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB` });
      }
      
      if (mimetype.startsWith("video/") && size > MAX_VIDEO_SIZE) {
        invalidFiles.push({ file, reason: `Video size exceeds ${MAX_VIDEO_SIZE / 1024 / 1024}MB` });
      }
    }
    
    if (invalidFiles.length > 0) {
      for (const file of req.files) {
        fs.unlinkSync(file.path);
      }
      throw new HttpException(
        StatusCodes.BAD_REQUEST, 
        invalidFiles.map(f => f.reason).join(", ")
      );
    }
  }
  
  next();
};

module.exports = { uploadFile, checkFileSize, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE };
