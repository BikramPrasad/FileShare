const FileRepo = require('../Repository/fileRepo');
const HttpError = require('standard-http-error');

module.exports = class GetFileController {
  constructor(request, response, fileRepo) {
    this.request = request;
    this.response = response;
    this.fileRepo = new FileRepo();
  }

  validate() {}

  async handleRequest() {
    try {
      this.validate();
      const { uuid } = this.request.params;
      const file = await this.fileRepo.findById(uuid);
      if (!file) {
        return this.response.render('download', {
          error: 'Link has been expired',
        });
      }
      return this.response.status(200).render('download', {
        uuid: file.uuid,
        fileName: file.filename,
        fileSize: file.size,
        downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
      });
    } catch (err) {
      console.log(err);
      this.response.status(500).json({
        error: err,
        status: false,
      });
    }
  }
};
