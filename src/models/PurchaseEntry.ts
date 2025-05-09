import mongoose from 'mongoose';

const PurchaseEntrySchema = new mongoose.Schema({
  serialNumber: {
    type: Number,
    required: [true, 'Serial number is required'],
    unique: true,
    min: [1, 'Serial number must be at least 1'],
    validate: {
      validator: function(v: number) {
        return Number.isInteger(v) && v > 0;
      },
      message: 'Serial number must be a positive integer'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    validate: {
      validator: function(v: string) {
        // Format like HR55AV3438
        return /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(v);
      },
      message: 'Vehicle number must follow format like HR55AV3438'
    }
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: [true, 'Party is required']
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item is required']
  },
  transitPassNo: {
    type: String,
    required: [true, 'Transit pass number is required'],
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{19}$/.test(v);
      },
      message: 'Transit pass number must be exactly 19 digits'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    validate: {
      validator: function(v: number) {
        return v >= 1 && v <= 99;
      },
      message: 'Quantity must be between 1 and 99'
    }
  },
  originFormJNo: {
    type: String,
    required: [true, 'Origin Form J number is required'],
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^[A-Z]{2}\d{11}$/.test(v);
      },
      message: 'Origin Form J number must start with 2 letters followed by 11 numbers'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Keep the compound index as well for extra security
PurchaseEntrySchema.index(
  { transitPassNo: 1, originFormJNo: 1 }, 
  { unique: true, name: 'unique_transit_origin' }
);

export default mongoose.models.PurchaseEntry || mongoose.model('PurchaseEntry', PurchaseEntrySchema);