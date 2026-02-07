import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import client from '@/api/client.js';
import {
  clearAuthStorage,
  getRole,
  getToken,
  getUserInfo,
  setRole,
  setToken,
  setUserInfo,
} from '@/utils/storage.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [tokenState, setTokenState] = useState(getToken());
  const [role, setRoleState] = useState(getRole());
  const [user, setUser] = useState(getUserInfo());
  const [loading, setLoading] = useState(true);

  const logout = useCallback((redirect = true) => {
    clearAuthStorage();
    sessionStorage.removeItem('role');
    setTokenState(null);
    setRoleState(null);
    setUser(null);
    if (redirect) {
      window.location.href = '/login';
    }
  }, []);

  const bootstrap = useCallback(async () => {
    if (!tokenState) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await client.get('/user/auth');
      if (data?.code === 200) {
        setUser(data.data);
        setRoleState(data.data.userRole);
        setUserInfo(data.data);
        setRole(data.data.userRole);
      } else {
        logout(false);
      }
    } catch (error) {
      console.error('Auth bootstrap failed', error);
      logout(false);
    } finally {
      setLoading(false);
    }
  }, [tokenState, logout]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const refreshUser = useCallback(async () => {
    if (!tokenState) return null;
    const { data } = await client.get('/user/auth');
    if (data.code === 200) {
      setUser(data.data);
      setUserInfo(data.data);
      setRole(data.data.userRole);
      setRoleState(data.data.userRole);
      return data.data;
    }
    return null;
  }, [tokenState]);

  const login = useCallback(async ({ userAccount, userPwd }) => {
    const { data } = await client.post('/user/login', { userAccount, userPwd });
    if (data.code !== 200) {
      throw new Error(data.msg || 'login failed');
    }
    const { token, role: userRole, ...rest } = data.data;
    setToken(token);
    setTokenState(token);
    setRole(userRole);
    setRoleState(userRole);
    setUserInfo(rest);
    setUser(rest);
    await refreshUser();
    return { role: userRole, profile: rest };
  }, [refreshUser]);

  const register = useCallback(async payload => {
    const { data } = await client.post('/user/register', payload);
    if (data.code !== 200) {
      throw new Error(data.msg || 'register failed');
    }
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: tokenState,
        role,
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
