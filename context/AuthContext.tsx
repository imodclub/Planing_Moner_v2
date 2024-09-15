// ชื่อไฟล์: AuthContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';


// เพิ่ม interface สำหรับ User
interface User {
  userId: string;
  _id: string;
  name: string
  // เพิ่มข้อมูลผู้ใช้อื่นๆ ตามต้องการ
}

// ปรับปรุง AuthContextType
interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthContext - isLoggedIn updated:', isLoggedIn);
    console.log('AuthContext - user updated:', user);
  }, [isLoggedIn, user]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!loginResponse.ok) throw new Error('Login failed');
      const loginData = await loginResponse.json();

      // เก็บ token ใน cookie หรือ localStorage
      Cookies.set('auth_token', loginData.token, { expires: 7 });

      // ตรวจสอบการยืนยันตัวตนทันทีหลังจากล็อกอิน
      const verifyResponse = await fetch('/api/verify-auth');
      if (!verifyResponse.ok) throw new Error('Verification failed');
      const verifyData = await verifyResponse.json();

      setUser(verifyData.user);
      setIsLoggedIn(true);
      setUserId(verifyData.user._id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ใน AuthContext.tsx หรือไฟล์ที่จัดการ authentication

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      // ลบข้อมูล user และ token ใน state
      setUser(null);
      setIsLoggedIn(false);
      setUserId(null);
      // ลบ token จาก localStorage หรือ cookie ในฝั่ง client (ถ้ามี)
      localStorage.removeItem('auth_token');
      // หรือ Cookies.remove('auth_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('auth_token');
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      const response = await fetch('/api/verify-auth', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Authentication failed');
      const data = await response.json();
      setUser(data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, loading, userId, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
