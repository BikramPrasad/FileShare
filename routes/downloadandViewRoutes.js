const express = require('express');
const router = express.Router();
const GetFileController = require('../controller/getFileController');
const DownloadFileController = require('../controller/downloadController');

router.get('/:uuid', async (request, response, next) => {
  let useCase = new GetFileController(request, response);
  await useCase.handleRequest();
});

router.get('/download/:uuid', async (request, response, next) => {
  let useCase = new DownloadFileController(request, response);
  await useCase.handleRequest();
});

module.exports = router;
