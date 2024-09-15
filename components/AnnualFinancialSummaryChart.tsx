// components/AnnualFinancialSummaryChart.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuth } from '@/context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialData {
  income: number[];
  expenses: number[];
  savings: number[];
}

const AnnualFinancialSummaryChart: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: [],
    expenses: [],
    savings: [],
  });
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const userId = user?.userId;

  const fetchDataSummary = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/financial-summary/${userId}`);
      if (response.ok) {
        if (response.status !== 304) {
          const data = await response.json();
          setFinancialData(data);
        } else {
          // ข้อมูลไม่เปลี่ยนแปลง ใช้ข้อมูลที่มีอยู่
          console.log('Data not modified, using cached data');
        }
      } else {
        throw new Error('Failed to fetch financial summary');
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      setError('Failed to load financial summary. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchDataSummary();
    } else {
      setLoading(false);
    }
  }, [fetchDataSummary, isLoggedIn, userId]);

 if (loading) {
   return <div>กำลังโหลดข้อมูล...</div>;
 }

 if (error) {
   return <div>Error: {error}</div>;
 }

 if (!isLoggedIn || !userId) {
   return <div>Please log in to access this chart.</div>;
 }

 if (
   !financialData.income.length &&
   !financialData.expenses.length &&
   !financialData.savings.length
 ) {
   return <div>No financial data available.</div>;
 }



  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'รายงานสรุปการเงินประจำปี',
      },
    },
  };

  const labels = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'รายรับ',
        data: financialData.income,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'รายจ่าย',
        data: financialData.expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'เงินออม',
        data: financialData.savings,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div>
      <h4>รายงานสรุปการเงินประจำปี</h4>
      <Bar options={options} data={data} />
    </div>
  );
};

export default AnnualFinancialSummaryChart;
