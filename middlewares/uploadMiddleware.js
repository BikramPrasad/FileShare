const multer = require('multer');
const path = require('path');
const HttpError = require('standard-http-error');
const { StatusCodes } = require('http-status-codes');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 10 },
});

const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          new HttpError(
            StatusCodes.BAD_REQUEST,
            'File too large. Max size allowed is 10MB.'
          )
        );
      }
      return next(new HttpError(StatusCodes.BAD_REQUEST, err.message));
    } else if (err) {
      return next(
        new HttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Something went wrong during file upload.'
        )
      );
    }
    next();
  });
};

module.exports = uploadMiddleware;
