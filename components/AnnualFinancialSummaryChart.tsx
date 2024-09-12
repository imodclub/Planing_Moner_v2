// components/AnnualFinancialSummaryChart.tsx

import React, { useEffect, useState } from 'react';
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
import { verifyAuth } from '@/lib/auth';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await verifyAuth();

        // เรียก API เพื่อดึงข้อมูลการเงิน
        const financialSummaryResponse = await fetch(
          `/api/financial-summary/${user.userId}`
        );
        if (!financialSummaryResponse.ok) {
          throw new Error('Failed to fetch financial summary');
        }

        const data = await financialSummaryResponse.json();
        setFinancialData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
      <h3>รายงานสรุปการเงินประจำปี</h3>
      <Bar options={options} data={data} />
    </div>
  );
};

export default AnnualFinancialSummaryChart;
