const MimeType = require('./mimeType');

const fileSizeValidator = (files, maxFileSize) => {
  if (!Array.isArray(files)) files = [files];
  return files.some((file) => file.size > maxFileSize);
};

const fileTypeValidator = (files, allowedMimeTypes = MimeType.AllowedTypes) => {
  if (!Array.isArray(files)) files = [files];
  return files.some((file) => !allowedMimeTypes.includes(file.mimetype));
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
