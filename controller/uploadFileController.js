const FileRepo = require('../Repository/fileRepo');
const { v4: uuid4 } = require('uuid');
const HttpError = require('standard-http-error');
const { fileSizeValidator, fileTypeValidator } = require('../utils/utils');
const MimeType = require('../utils/mimeType');
const FileSize = require('../utils/fileSize');

module.exports = class UploadFileController {
  constructor(request, response, fileRepo) {
    this.request = request;
    this.response = response;
    this.fileRepo = new FileRepo();
  }

  validate() {
    if (!this.request.file) {
      throw new HttpError(400, 'Please upload an image.');
    }
    if (fileTypeValidator([this.request.file], MimeType.ImageAndPng)) {
      throw new HttpError(400, 'Only Image are allowed.');
    }
    if (fileSizeValidator([this.request.file], FileSize.Large)) {
      throw new HttpError(400, 'Uploaded file size is too large.');
    }
  }

  async handleRequest() {
    try {
      this.validate();
      const payload = {
        filename: this.request.file.filename,
        uuid: uuid4(),
        path: this.request.file.path,
        size: this.request.file.size,
      };

      await this.fileRepo.create(payload);
      return this.response
        .status(200)
        .json({ file: `${process.env.APP_BASE_URL}/files/${payload.uuid}` });
    } catch (err) {
      console.log(err);
      this.response.status(500).json({
        error: err,
        status: false,
      });
    }
  }
};
