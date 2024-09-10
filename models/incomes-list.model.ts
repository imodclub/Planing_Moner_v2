import mongoose from 'mongoose';

const incomesListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',  // ต้องแน่ใจว่ามีโมเดล User ถูกต้อง
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
const IncomesList = mongoose.models.IncomesList || mongoose.model('IncomesList', incomesListSchema);

export default IncomesList;
