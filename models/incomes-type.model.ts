// models/expenses.model.ts
import mongoose from 'mongoose';

const incomeTypeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  items: [
    {
      typeName: {
        type: String,
        required: true,
      },      
    },
  ],
});

const IncomeType = mongoose.models.IncomeType || mongoose.model('Expense', incomeTypeSchema);

export default IncomeType;