require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

// Initialize S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});


const uploadToS3 = async (localFilePath, originalFileName) => {
  const fileStream = fs.createReadStream(localFilePath);
  const contentType = mime.lookup(localFilePath) || 'application/octet-stream';

  const s3Key = `uploads/${Date.now()}_${originalFileName}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: s3Key,
    Body: fileStream,
    ContentType: contentType,
  };

  try {
    const data = await s3.send(new PutObjectCommand(uploadParams));
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    return fileUrl;
  } catch (err) {
    console.error('❌ Upload failed:', err);
    throw new Error('Error uploading content!');
  }
};

module.exports = uploadToS3;
