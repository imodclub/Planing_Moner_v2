// components/AnnualFinancialSummaryChart.tsx

import React, { useEffect, useState, useRef } from 'react';
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
import Cookies from 'js-cookie';

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const isFetched = useRef(false);

  useEffect(() => {
    const sessionIdFromCookie = Cookies.get('sessionID');
    if (sessionIdFromCookie) {
      setSessionId(sessionIdFromCookie);
      console.log('Fetched sessionID from cookie:', sessionIdFromCookie);
    } else {
      console.error('No sessionId found in cookie');
    }
  }, []);

  useEffect(() => {
    if (sessionId && !isFetched.current) {
      const fetchData = async () => {
        try {
          // เรียก API เพื่อค้นหา userID จาก sessionID
          const userIdResponse = await fetch(`/api/session/${sessionId}`);
          if (!userIdResponse.ok) {
            console.error('Failed to fetch userID');
            return;
          }

          const { userId } = await userIdResponse.json();
          setUserId(userId);

          const userNameResponse = await fetch(`/api/users/${userId}`);
          if (!userNameResponse.ok) {
            console.error('Failed to fetch userName');
            return;
          }

          const { name } = await userNameResponse.json();
          setUserName(name);

          // เรียก API เพื่อดึงข้อมูลการเงิน
          const financialSummaryResponse = await fetch(
            `/api/financial-summary/${userId}`
          );
          if (!financialSummaryResponse.ok) {
            console.error('Failed to fetch financial summary');
            return;
          }

          const data = await financialSummaryResponse.json();
          setFinancialData(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        isFetched.current = true;
      };

      fetchData();
    }
  }, [sessionId]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `รายงานสรุปการเงินประจำปี`,
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

  return (
    <div>
      <h3>รายงานสรุปการเงินประจำปี</h3>
      <Bar options={options} data={data} />
    </div>
  );
};

export default AnnualFinancialSummaryChart;
