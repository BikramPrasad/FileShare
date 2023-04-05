const MimeType = require('./mimeType');

const fileSizeValidator = (file, maxFileSize) => {
  const isFileUploaded = file.find((e) => e.size > maxFileSize);
  return isFileUploaded ? true : false;
};

const fileTypeValidator = (file, mimeType) => {
  let isFileTypeError;
  switch (mimeType) {
    case MimeType.ImageAndPng:
      isFileTypeError = file.find((e) => !e.mimetype.includes('image/png'));
      break;
    case MimeType.Pdf:
      isFileTypeError = file.find(
        (e) => !e.mimetype.includes('application/pdf')
      );
      break;

    case MimeType.XLSX:
      isFileTypeError = file.find(
        (e) =>
          !e.mimetype.includes(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
      );
      break;
  }
  return isFileTypeError ? true : false;
};

const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(email);
};

module.exports = {
  fileSizeValidator,
  fileTypeValidator,
  validateEmail,
};
