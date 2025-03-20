const mongoose = require('mongoose');
const IdentifierGenerator = require('mongoose-plugin-autoinc');

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    size: { type: Number, required: true },
    sender: { type: String, required: false },
    receiver: { type: String, required: false },
  },
  { _id: false, timestamps: true }
);
fileSchema.plugin(IdentifierGenerator.plugin, {
  model: 'File',
  startAt: 100001,
});

module.exports = mongoose.model('File', fileSchema);
