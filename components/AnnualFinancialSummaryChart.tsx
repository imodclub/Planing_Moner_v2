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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeResponse = await fetch('/api/save-income');
        const expensesResponse = await fetch('/api/save-expenses');
        const savingsResponse = await fetch('/api/save-savings');

        const incomeData = await incomeResponse.json();
        const expensesData = await expensesResponse.json();
        const savingsData = await savingsResponse.json();

        setFinancialData({
          income: incomeData,
          expenses: expensesData,
          savings: savingsData,
        });
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchData();
  }, []);

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
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'รายรับ',
        data: financialData.income,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'รายจ่าย',
        data: financialData.expenses,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'เงินออม',
        data: financialData.savings,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div>
      <h2>รายงานสรุปการเงินประจำปี</h2>
      <Bar options={options} data={data} />
    </div>
  );
};

export default AnnualFinancialSummaryChart;
