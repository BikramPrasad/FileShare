const MimeType = require('./mimeType');

const fileSizeValidator = (files, maxFileSize) => {
  if (!Array.isArray(files)) files = [files];
  return files.some((file) => file.size > maxFileSize);
};

const fileTypeValidator = (files, allowedMimeTypes = MimeType.AllowedTypes) => {
  if (!Array.isArray(files)) files = [files];
  return files.some((file) => !allowedMimeTypes.includes(file.mimetype));
};

const validateEmail = (input) => {
  const re =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  if (Array.isArray(input)) {
    return input.every((email) => re.test(email));
  }

  return re.test(input);
};

module.exports = {
  fileSizeValidator,
  fileTypeValidator,
  validateEmail,
};
