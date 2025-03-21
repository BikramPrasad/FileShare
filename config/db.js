require('dotenv').config();
const mongoose = require('mongoose');

class MongoService {
  static instance;

  constructor() {
    if (MongoService.instance) {
      return MongoService.instance;
    }

    this._connected = false;
    MongoService.instance = this;
  }

  async init() {
    if (this._connected) {
      console.log('⚠️ MongoDB already connected.');
      return;
    }

    try {
      await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
      });

      this._connected = true;
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB:', err);
      throw err;
    }
  }

  async destroy() {
    if (this._connected) {
      try {
        await mongoose.connection.close();
        this._connected = false;
        console.log('🛑 MongoDB connection closed');
      } catch (err) {
        console.error('❌ Error while closing MongoDB connection:', err);
      }
    }
  }

  static getInstance() {
    if (!MongoService.instance) {
      MongoService.instance = new MongoService();
    }
    return MongoService.instance;
  }
}

module.exports = MongoService;
