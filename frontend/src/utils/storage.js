const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const USER_INFO_KEY = 'userInfo';
const ACTIVE_PATH = 'activeMenuItem';

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = token => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const getRole = () => {
  const role = sessionStorage.getItem(ROLE_KEY);
  return role ? Number(role) : null;
};
export const setRole = role => sessionStorage.setItem(ROLE_KEY, role ?? '');

export const getUserInfo = () => {
  const info = sessionStorage.getItem(USER_INFO_KEY);
  return info ? JSON.parse(info) : null;
};
export const setUserInfo = info => {
  if (!info) {
    sessionStorage.removeItem(USER_INFO_KEY);
    return;
  }
  sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
};
export const clearUserInfo = () => sessionStorage.removeItem(USER_INFO_KEY);

export const getActivePath = () => sessionStorage.getItem(ACTIVE_PATH);
export const setActivePath = path => sessionStorage.setItem(ACTIVE_PATH, path);

export const clearAuthStorage = () => {
  clearToken();
  sessionStorage.removeItem(ROLE_KEY);
  clearUserInfo();
};
