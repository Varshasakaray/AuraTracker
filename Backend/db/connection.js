import mongoose from 'mongoose';

async function ConnectMongoDb(url) {
  try {
    return mongoose.connect(url); // No need for deprecated options
  } catch (err) {
    console.log('Error connecting to MongoDB:', err);
  }
}

export { ConnectMongoDb };
