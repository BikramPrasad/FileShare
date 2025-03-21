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
  }

  validate() {
    const file = this.request.file;
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
    try {
      this.validate();

      const file = this.request.file;
      const uuid = uuidv4();
      const localPath = file.path;

      const s3Url = await uploadToS3(localPath, file.filename);

      await fs.unlink(localPath);
      if (!s3Url) {
        throw new HttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Upload to S3 failed. No URL received.'
        );
      }

      const payload = {
        filename: file.filename,
        uuid,
        fileUrl: s3Url,
        size: file.size,
      };

      await this.fileRepo.create(payload);

      return this.response.status(StatusCodes.OK).json({
        status: true,
        fileId: uuid
      });
    } catch (err) {
      console.error(err);
      return this.response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        error: err.message || 'Something went wrong.',
      });
    }
  }
};
