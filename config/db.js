require('dotenv').config();
const moongoose = require('mongoose');

const connectDB = async () => {
  try {
    await moongoose.connect(process.env.MONGO_CONNECTION_URL, {
      useNewUrlParser: true,
      autoIndex: false,
    });
    console.log('Database connected...');
  } catch (err) {
    console.log(`Error connecting to Database ${err}`);
  }
};

module.exports = connectDB;
