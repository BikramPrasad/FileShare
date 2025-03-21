const EmailModel = require('../models/email');

module.exports = class EmailRepo {
  async create(data) {
    return await EmailModel.create(data);
  }

  async findByFileID(fileId) {
    return await EmailModel.findOne({ fileId: fileId, status: 'SENT' });
  }

  async findById(id) {
    return await EmailModel.findById(id);
  }
};
