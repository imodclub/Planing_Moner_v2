import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  userId: string | null;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const token = Cookies.get('auth_token');
      if (token) {
        const response = await fetch('/api/verify-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserId(data.userId);
          return true;
        }
      }
      setIsLoggedIn(false);
      setUserId(null);
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUserId(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (newUserId: string) => {
    setLoading(true);
    try {
      // ทำการล็อกอินที่นี่ (อาจจะเป็นการเรียก API)
      // สมมติว่าการล็อกอินสำเร็จ:
      setIsLoggedIn(true);
      setUserId(newUserId);
      Cookies.set('auth_token', 'your_auth_token_here', { expires: 7 });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // ทำการล็อกเอาท์ที่นี่ (อาจจะเป็นการเรียก API)
      Cookies.remove('auth_token');
      setIsLoggedIn(false);
      setUserId(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, loading, userId, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
