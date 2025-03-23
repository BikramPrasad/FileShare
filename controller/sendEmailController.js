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
    this.logger = request.logger;
    this.emailToList = [];
  }

  validate() {
    const { title, message, fileId, emailTo, emailFrom } = this.request.body;
    if (!fileId || !emailFrom || !emailTo || !title || !message) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'All the fields are required.'
      );
    }

    // Validate emailFrom
    if (!validateEmail(emailFrom)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Please enter a valid emailFrom address.'
      );
    }

    // Validate and process multiple comma-separated emailTo addresses
    const emailList = emailTo
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const allValid = emailList.every(validateEmail);

    if (!allValid) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'Please enter valid emailTo addresses.'
      );
    }

    this.emailToList = emailList;
  }

  async handleRequest() {
    try {
      const { fileId, title, message, emailFrom } = this.request.body;
      this.validate();

      const file = await this.fileRepo.findById(fileId);
      if (!file) {
        this.logger.warn('⚠️ File not found in DB for email send', { fileId });
        return this.response.status(StatusCodes.NOT_FOUND).json({
          status: false,
          error: 'Uploaded file not found.',
        });
      }

      const emailExists = await this.emailRepo.findByFileID(fileId);
      if (emailExists) {
        this.logger.warn('⚠️ Email already sent for this fileId', { fileId });
        return this.response.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
          status: false,
          error: 'File URL has already been sent via email.',
        });
      }

      const emailPayload = {
        from: emailFrom,
        to: this.emailToList,
        subject: message,
        title: title,
        fileId: fileId,
      };
      console.log("THe email Payload is ", emailPayload)
      const sendEmail = await sendEmailViaSNS(emailPayload);

      if (!sendEmail) {
        throw new HttpError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to send Email.'
        );
      }

      const emailRecord = {
        to: this.emailToList,
        from: emailFrom,
        fileId,
        message,
        title,
      };

      await this.emailRepo.create(emailRecord);

      this.logger.info('✅ Email sent and DB record created', emailRecord);

      return this.response.status(StatusCodes.OK).json({
        status: true,
        message: 'Email sent successfully.',
      });
    } catch (err) {
      this.logger.error('❌ SendEmailController error', {
        message: err.message,
        stack: err.stack,
      });

      return this.response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        error: err.message || 'Something went wrong while sending email.',
      });
    }
  }
};
