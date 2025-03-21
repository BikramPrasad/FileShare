const MimeType = class {};
MimeType.ImageAndPng = 1;
MimeType.Pdf = 2;
MimeType.XLSX = 3;
MimeType.AllowedTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.ms-excel',
];

module.exports = MimeType;
