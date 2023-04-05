const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const UploadFileController = require('../controller/uploadFileController');
const SendEmailControler = require('../controller/sendEmailController');

router.post('/upload', upload, async (request, response, next) => {
  let useCase = new UploadFileController(request, response);
  await useCase.handleRequest();
});

router.post('/send', async (request, response, next) => {
  let useCase = new SendEmailControler(request, response);
  await useCase.handleRequest();
});

module.exports = router;
