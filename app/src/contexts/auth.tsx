import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { loginApi, registerApi } from '@/api/auth';
import { useAlert } from '@/ui/AlertProvider';

interface User {
  email: string;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nickname: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'donkimi_token';
const USER_KEY = 'donkimi_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const showAlert = useAlert();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 저장된 토큰 복원
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userStr = await SecureStore.getItemAsync(USER_KEY);
        if (token && userStr) {
          setAuthToken(token);
          setUser(JSON.parse(userStr));
        }
      } catch {
        // 무시
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginApi(email, password);
    setAuthToken(result.accessToken);
    await SecureStore.setItemAsync(TOKEN_KEY, result.accessToken);
    const u = { email: result.email, nickname: result.nickname };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const register = async (nickname: string, email: string, password: string) => {
    await registerApi(nickname, email, password);
  };

  const logout = async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  };

  // 토큰 만료(401) 시: 세션 정리 + 로그인 화면으로. 중복 알림 방지용 ref.
  const handledExpiry = useRef(false);
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (handledExpiry.current) return;
      handledExpiry.current = true;
      logout().finally(() => {
        showAlert('세션 만료', '로그인이 만료되었습니다. 다시 로그인해주세요.', undefined, { variant: 'warning' });
        router.replace('/login');
        setTimeout(() => {
          handledExpiry.current = false;
        }, 2000);
      });
    });
    return () => setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
