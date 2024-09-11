import mongoose from 'mongoose';

const savingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
timestamp: {
    type: Date,
    default: Date.now,
  },
  items: [
    {
      label: {
        type: String,
        required: true,
        default: '',
      },
      amount: {
        type: Number,
        required: false,
        default: 0,
      },
      comment: {
        type: String,
        required: false,
        default: '',
      },
    },
  ],
});

// เปลี่ยนให้ชื่อโมเดลตรงกันทั้งสองที่
const SavingsList = mongoose.models.SavingsList || mongoose.model('SavingsList', savingListSchema);

export default SavingsList;
