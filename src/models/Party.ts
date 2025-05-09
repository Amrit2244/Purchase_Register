import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Party name is required'],
    unique: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Party || mongoose.model('Party', PartySchema);