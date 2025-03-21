const HttpError = require('standard-http-error');
const { StatusCodes } = require('http-status-codes');
const EmailRepo = require('../Repository/emailRepo');
const FileRepo = require('../Repository/fileRepo');
const { validateEmail } = require('../utils/utils');
const sendEmailViaSNS = require('../utils/sendEmailPublisher');

module.exports = class SendEmailController {
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.emailRepo = new EmailRepo();
    this.fileRepo = new FileRepo();
  }

  validate() {
    const { title, message, fileId, emailTo, emailFrom } = this.request.body;

    if (!fileId || !emailFrom || !emailTo || !title || !message) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'All the fields are required.'
      );
    }

    if (!validateEmail(emailTo) || !validateEmail(emailFrom)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Please enter a valid email address.'
      );
    }
  }

  async handleRequest() {
    try {
      const { fileId, title, message, emailTo, emailFrom } = this.request.body;

      const file = await this.fileRepo.findById(fileId);
      if (!file) {
        return this.response.status(StatusCodes.NOT_FOUND).json({
          status: false,
          error: 'Uploaded file not found.',
        });
      }

      const emailExists = await this.emailRepo.findByFileID(fileId);
      if (emailExists) {
        return this.response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          status: false,
          error: 'File URL has already been sent via email.',
        });
      }

      const emailPayload = {
        from: emailFrom,
        to: emailTo,
        subject: title,
        text: message,
      };

      const sendEmail = await sendEmailViaSNS(emailPayload);

      if (!sendEmail) {
        throw new HttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to send Email.'
        );
      }

      const emailRecord = {
        to: emailTo,
        from: emailFrom,
        fileId: fileId,
        message: message,
        title: title,
      };
      await this.emailRepo.create(emailRecord);

      return this.response.status(StatusCodes.OK).json({
        status: true,
        message: 'Email sent successfully.',
      });
    } catch (err) {
      console.error(err);
      return this.response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        error: err.message || 'Something went wrong while sending email.',
      });
    }
  }
};
