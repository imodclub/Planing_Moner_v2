import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/models/db';
import Income from '@/models/incomes.model';
import Expense from '@/models/expenses.model';

interface IncomeItem {
  label: string;
  amount: number;
  comment?: string;
}

interface AggregatedData {
  amount: number;
  comments: Set<string>;
}

interface FormattedIncomeData {
  label: string;
  amount: number;
  comment: string;
}

interface ExpenseItem {
  label: string;
  amount: number;
  comment?: string;
}


interface FormattedExpenseData {
  label: string;
  amount: number;
  comment: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, report } = req.query;
  await dbConnect();

  switch (req.method) {
    case 'GET':
      switch (report) {
        case 'totalIncome':
          return getTotalIncome(req, res, userId as string);
          case 'totalExpense':
          return getTotalExpense(req, res, userId as string);
        default:
          return res
            .status(400)
            .json({ success: false, message: 'Invalid report type' });
      }
    default:
      return res
        .status(405)
        .json({ success: false, message: 'Method not allowed' });
  }
}

async function getTotalIncome(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const incomes = await Income.find({ userId });

    const aggregatedData = incomes.reduce(
      (acc: Record<string, AggregatedData>, income) => {
        income.items.forEach((item: IncomeItem) => {
          // ตรวจสอบว่า amount ไม่เท่ากับ 0 และ label ไม่เป็นช่องว่าง
          if (item.amount !== 0 && item.label.trim() !== '') {
            if (!acc[item.label]) {
              acc[item.label] = { amount: 0, comments: new Set() };
            }
            acc[item.label].amount += item.amount;
            if (item.comment && item.comment.trim() !== '') {
              acc[item.label].comments.add(item.comment.trim());
            }
          }
        });
        return acc;
      },
      {}
    );

    const formattedData: FormattedIncomeData[] = Object.entries(
      aggregatedData
    ).map(([label, data]) => ({
      label,
      amount: data.amount,
      comment: Array.from(data.comments).join(', '),
    }));

    // กรองข้อมูลที่มี amount เป็น 0 ออก (กรณีที่มีการหักลบกันจนเหลือ 0)
    const filteredData = formattedData.filter((item) => item.amount !== 0);

    return res.status(200).json({ success: true, data: filteredData });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: (error as Error).message });
  }
}

async function getTotalExpense(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  try {
    const expenses = await Expense.find({ userId });

    const aggregatedData = expenses.reduce(
      (acc: Record<string, AggregatedData>, expense) => {
        expense.items.forEach((item: ExpenseItem) => {
          if (item.amount !== 0 && item.label.trim() !== '') {
            if (!acc[item.label]) {
              acc[item.label] = { amount: 0, comments: new Set() };
            }
            acc[item.label].amount += item.amount;
            if (item.comment && item.comment.trim() !== '') {
              acc[item.label].comments.add(item.comment.trim());
            }
          }
        });
        return acc;
      },
      {}
    );

    const formattedData: FormattedExpenseData[] = Object.entries(
      aggregatedData
    ).map(([label, data]) => ({
      label,
      amount: data.amount,
      comment: Array.from(data.comments).join(', '),
    }));

    const filteredData = formattedData.filter(item => item.amount !== 0);

    return res.status(200).json({ success: true, data: filteredData });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: (error as Error).message });
  }
}