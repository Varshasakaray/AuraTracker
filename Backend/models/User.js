import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNo: { type: String, required: true },
  semester: { type: Number, required: true },
  DOB: { type: Date, required: true },
  course: { type: String, required: true },
  regno: { type: String, required: true, unique: true },
});

export default mongoose.model('User', userSchema);
