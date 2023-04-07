const FileRepo = require('../Repository/fileRepo');
const HttpError = require('standard-http-error');
const { validateEmail } = require('../utils/utils');
const sendEmail = require('../service/emailService');

module.exports = class SendEmailControler {
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.fileRepo = new FileRepo();
  }

  validate() {
    const { uuid, emailTo, emailFrom } = this.request.body;
    if (!uuid || !emailFrom || !emailTo) {
      throw new HttpError(400, 'All the fields are required.');
    }
    if (!validateEmail(emailTo)) {
      throw new HttpError(400, 'Please enter valid email.');
    }
  }

  async handleRequest() {
    try {
      this.validate();
      const { uuid, emailTo, emailFrom } = this.request.body;
      const file = await this.fileRepo.findById(uuid);
      if (file.sender) {
        return this.response.status(422).send({ error: 'Email already sent.' });
      }
      file.sender = emailFrom;
      file.receiver = emailTo;
      await file.save();

      //send Email
      await sendEmail({
        from: emailFrom,
        to: emailTo,
        subject: 'File Share',
        text: `${emailFrom} shared a file with you.`,
        html: require('../service/emailTemplate')({
          emailFrom: emailFrom,
          downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
          size: parseInt(file.size / 1000) + 'KB',
          expires: '24 hrs',
        }),
      });
      return this.response.send({ success: true });
    } catch (err) {
      console.log(err);
      this.response.status(500).json({
        error: err,
        status: false,
      });
    }
  }
};
