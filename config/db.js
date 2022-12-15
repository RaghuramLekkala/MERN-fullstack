const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true });

    console.log('====================================');
    console.log('MongoDB connected....');
    console.log('====================================');
  } catch (err) {
    console.log('err', err);

    // Exit the process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
