const mongoose = require('mongoose');
const IdentifierGenerator = require('mongoose-plugin-autoinc');

const STATUS = {
  INPROGRESS: 'INPROGRESS',
  SENT: 'SENT',
  FAILED: 'FAILED',
};

const emailSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    to: { type: String, required: true },
    from: { type: [String], required: true },
    fileId: {
      type: String,
      required: true,
      ref: 'file',
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.INPROGRESS,
    },
  },
  { _id: false, timestamps: true }
);

emailSchema.plugin(IdentifierGenerator.plugin, {
  model: 'Email',
  startAt: 100001,
});

module.exports = mongoose.model('Email', emailSchema);