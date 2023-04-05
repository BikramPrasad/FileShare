const FileModel = require('../models/file');

class FileRepo {
  async create(data) {
    const result = await FileModel.create(data);
    return result.toJSON();
  }

  async findById(id) {
    const result = await FileModel.findOne({ uuid: id });
    return result;
  }

  async delete(id) {
    const result = await FileModel.findByPk(id);
    await FileModel.destroy({ where: { id } });
    return result.toJSON();
  }
}

module.exports = FileRepo;
