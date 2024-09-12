import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { verifyAuth } from '@/lib/auth';
import { useRouter } from 'next/router';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FinancialItem {
  date: string;
  items: Array<{
    label: string;
    amount: number | string;
    comment?: string;
  }>;
}
interface ShortTotalProps {
  userId: string;
}

const ShortTotal: React.FC<ShortTotalProps> = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalSaving, setTotalSaving] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await verifyAuth();
        const userId = user.userId;

        const [incomeData, expenseData, savingData] = await Promise.all([
          fetchFinancialData('income', userId),
          fetchFinancialData('expense', userId),
          fetchFinancialData('saving', userId),
        ]);

        const currentYear = new Date().getFullYear();

        setTotalIncome(calculateYearlyTotal(incomeData, currentYear));
        setTotalExpense(calculateYearlyTotal(expenseData, currentYear));
        setTotalSaving(calculateYearlyTotal(savingData, currentYear));
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        if (error instanceof Error && error.message === 'Unauthorized') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchFinancialData = async (
    type: 'income' | 'expense' | 'saving',
    userId: string
  ): Promise<FinancialItem[]> => {
    const response = await fetch(`/api/${type}/${userId}`);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[
      type === 'income'
        ? 'incomes'
        : type === 'expense'
        ? 'expenses'
        : 'savings'
    ];
  };

  const calculateYearlyTotal = (
    data: FinancialItem[],
    year: number
  ): number => {
    return data
      .filter((item) => new Date(item.date).getFullYear() === year)
      .reduce((total, item) => {
        return total + item.items.reduce((sum, i) => sum + Number(i.amount), 0);
      }, 0);
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const chartData = {
    labels: ['รายรับ', 'รายจ่าย', 'เงินออม'],
    datasets: [
      {
        data: [totalIncome, totalExpense, totalSaving],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>สรุปข้อมูลทางการเงินปี {new Date().getFullYear()}</h2>
      <p>รายรับทั้งหมด: {formatNumber(totalIncome)} บาท</p>
      <p>รายจ่ายทั้งหมด: {formatNumber(totalExpense)} บาท</p>
      <p>เงินออมทั้งหมด: {formatNumber(totalSaving)} บาท</p>
      <div style={{ width: '300px', height: '300px' }}>
        <Pie data={chartData} />
      </div>
    </div>
  );
};

export default ShortTotal;
