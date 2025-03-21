const express = require('express');
const router = express.Router();
const UploadFileController = require('../controller/uploadFileController');
const SendEmailControler = require('../controller/sendEmailController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

router.post('/upload', uploadMiddleware, async (req, res, next) => {
  const controller = new UploadFileController(req, res);
  await controller.handleRequest();
});

router.post('/send', async (request, response, next) => {
  let useCase = new SendEmailControler(request, response);
  await useCase.handleRequest();
});

module.exports = router;
