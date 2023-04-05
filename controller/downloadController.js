const FileRepo = require('../Repository/fileRepo');

module.exports = class DownloadFileController {
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
      console.log(uuid)
      const file = await this.fileRepo.findById(uuid);
      if (!file) {
        return this.response.render('download', {
          error: 'Link has been expired',
        });
      }
      const filePath = `${__dirname}/../${file.path}`;
      this.response.download(filePath);
    } catch (err) {
      console.log(err);
      this.response.status(500).json({
        error: err,
        status: false,
      });
    }
  }
};
