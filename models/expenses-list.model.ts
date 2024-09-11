import mongoose from 'mongoose';

const ExpenseListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',  // ต้องแน่ใจว่ามีโมเดล User ถูกต้อง
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
const ExpenseList = mongoose.models.ExpenseList || mongoose.model('ExpenseList', ExpenseListSchema);

export default ExpenseList;
