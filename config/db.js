const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const dev_db_url = "mongodb://127.0.0.1:27017/emailmgt";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoDB);
        console.log('mongoDB connected:');
    } catch (error) {
        console.log('db not conntect ');
        process.exit(1);
    }
}

module.exports = { connectDB, mongoDB };