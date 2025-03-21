const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
require('dotenv').config();

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const sendEmailViaSNS = async (messageData) => {
  try {
    const topicArn = process.env.SNS_TOPIC_ARN;

    if (!topicArn) {
      console.error('SNS_TOPIC_ARN is missing in environment variables');
      return null;
    }

    const params = {
      TopicArn: topicArn,
      Message: JSON.stringify(messageData),
    };

    const command = new PublishCommand(params);
    const result = await sns.send(command);
    return result;
  } catch (error) {
    console.error('Error publishing to SNS:', error);
    return null;
  }
};

module.exports = sendEmailViaSNS;
