import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    default: 'Cubic Meter',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);