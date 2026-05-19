const mongoose = require('mongoose');

async function connectDB(){
    try{
    if (!process.env.MONGOURI) {
        throw new Error('MONGOURI is not set. Add it to your .env file.');
    }
    await mongoose.connect(process.env.MONGOURI);
        console.log('Connected to MongoDB');
    }catch(err){
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
    }
}

module.exports = connectDB;