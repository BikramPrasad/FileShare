const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
var cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const PORT = process.env.PORT || 5000;

//connect Database
connectDB();
const corsOption = {
  origin: process.env.ALLOWED_CLIENTS.split(','),
};
app.use(cors(corsOption));
app.use(express.static('public'));
app.use(express.json({ extended: false }));
//Routes
app.use('/api/files', require('./routes/uploadFileandSendEmailRoutes'));
app.use('/files', require('./routes/downloadandViewRoutes'));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
