const { v4: uuidv4 } = require('uuid');
const fs = require('fs/promises');
const HttpError = require('standard-http-error');
const { StatusCodes } = require('http-status-codes');
const FileRepo = require('../Repository/fileRepo');
const MimeType = require('../utils/mimeType');
const FileSize = require('../utils/fileSize');
const uploadToS3 = require('../utils/uploadToS3');
const { fileSizeValidator, fileTypeValidator } = require('../utils/utils');

module.exports = class UploadFileController {
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.fileRepo = new FileRepo();
    this.logger = request.logger; // 👈 use req.logger from middleware
  }

  validate(file) {
    if (!file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Please upload a file.');
    }

    if (fileTypeValidator([file], MimeType.AllowedTypes)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Unsupported file type.');
    }

    if (fileSizeValidator([file], FileSize.Small)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'File size exceeds 2MB.');
    }
  }

  async handleRequest() {
    const file = this.request.file;
    const localPath = file?.path;

    try {
      this.validate(file);
      const uuid = uuidv4();

      this.logger.info('🆙 File validated', {
        filename: file.filename,
        size: file.size,
      });

      // Upload to S3
      const s3Url = await uploadToS3(localPath, file.filename);

      if (!s3Url) {
        throw new HttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Upload to S3 failed. No URL received.'
        );
      }

      this.logger.info('✅ File uploaded to S3', {
        s3Url,
        filename: file.filename,
      });

      // Save file details to DB
      const payload = {
        filename: file.filename,
        fileId:uuid,
        fileUrl: s3Url,
        size: file.size,
      };

      await this.fileRepo.create(payload);

      await fs.unlink(localPath).catch(() => {});

      this.logger.info('💾 File saved in DB & local file cleaned up', {
        fileId: uuid,
      });

      return this.response.status(StatusCodes.OK).json({
        status: true,
        fileId: uuid,
      });
    } catch (err) {
      if (localPath) {
        await fs.unlink(localPath).catch(() => {});
      }

      this.logger.error('❌ UploadFileController error', {
        message: err.message,
        stack: err.stack,
      });

      return this.response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        error: err.message || 'Something went wrong.',
      });
    }
  }
};
