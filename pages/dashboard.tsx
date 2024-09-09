// pages/dashboard.tsx
import { GetServerSideProps } from 'next';

export default function Dashboard() {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      {/* เนื้อหาของหน้า dashboard */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const sessionId = req.cookies.sessionID;

  if (!sessionId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // ส่ง props ไปยังคอมโพเนนต์ Dashboard
  };
};
