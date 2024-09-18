import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { useAuth } from '@/context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FinancialItem {
  label: string;
  amount: number | string;
  comment?: string;
}

interface FinancialEntry {
  date: string;
  items: FinancialItem[];
}

interface FinancialData {
  incomes: FinancialEntry[];
  expenses: FinancialEntry[];
  savings: FinancialEntry[];
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  balance: number;
}

const ShortFinancialSummaryReport: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    totalSaving: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const [incomeRes, expenseRes, savingRes] = await Promise.all([
          fetch(`/api/incomes/${userId}?showAmounts=true`),
          fetch(`/api/expense/${userId}`),
          fetch(`/api/saving/${userId}`), // แก้ไขเป็น 'savings'
        ]);

        const [incomeData, expenseData, savingData]: [
          FinancialData,
          FinancialData,
          FinancialData
        ] = await Promise.all([
          incomeRes.json(),
          expenseRes.json(),
          savingRes.json(),
        ]);

        const totalIncome = calculateTotal(incomeData.incomes);
        const totalExpense = calculateTotal(expenseData.expenses);
        const totalSaving = calculateTotal(savingData.savings);
        const balance = totalIncome - totalExpense - totalSaving;

        setSummary({ totalIncome, totalExpense, totalSaving, balance });
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const calculateTotal = (data: FinancialEntry[] | undefined): number => {
    if (!data) return 0;
    return data.reduce((total, entry) => {
      return (
        total +
        entry.items.reduce((sum, item) => {
          const amount =
            typeof item.amount === 'string'
              ? parseFloat(item.amount)
              : item.amount;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0)
      );
    }, 0);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('th-TH', { maximumFractionDigits: 0 });
  };

  const calculatePercentage = (value: number, total: number): string => {
    return ((value / total) * 100).toFixed(1);
  };

  const totalSum =
    summary.totalIncome + summary.totalExpense + summary.totalSaving;

  const chartData: ChartData<'pie'> = {
    labels: ['รายรับ', 'รายจ่าย', 'เงินออม'],
    datasets: [
      {
        data: [summary.totalIncome, summary.totalExpense, summary.totalSaving],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  const chartOptions: ChartOptions<'pie'> = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = calculatePercentage(value, totalSum);
            return `${label}: ${formatNumber(value)} บาท (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="short-financial-summary">
      <h2>สรุปข้อมูลการเงิน</h2>
      <div className="summary-details">
        <p>
          <strong>รวมรายรับทั้งหมด:</strong> {formatNumber(summary.totalIncome)}{' '}
          บาท
        </p>
        <p>
          <strong>รวมรายจ่ายทั้งหมด:</strong>{' '}
          {formatNumber(summary.totalExpense)} บาท
        </p>
        <p>
          <strong>รวมเงินออมทั้งหมด:</strong>{' '}
          {formatNumber(summary.totalSaving)} บาท
        </p>
        <p>
          <strong>เงินคงเหลือ:</strong> {formatNumber(summary.balance)} บาท
        </p>
      </div>
      <div className="chart-container">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ShortFinancialSummaryReport;
