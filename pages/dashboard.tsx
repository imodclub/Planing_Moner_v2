// pages/dashboard.tsx
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // คุณสามารถใช้ useEffect เพื่อทำการตรวจสอบเพิ่มเติมในฝั่ง client หากจำเป็น
  }, []);

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      {/* เนื้อหาของหน้า dashboard */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const sessionId = req.cookies.sessionID;

  if (!sessionId) {
    // หากไม่มี sessionID ให้เปลี่ยนเส้นทางไปที่หน้า Login
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  // ตรวจสอบเซสชันในฐานข้อมูล (ถ้าจำเป็น)
  // const session = await Session.findOne({ sessionId });
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: '/sign-in',
  //       permanent: false,
  //     },
  //   };
  // }

  return {
    props: {}, // ส่ง props ไปยังคอมโพเนนต์ Dashboard
  };
};
