const KEY = "studymate.token";
const USER_KEY = "studymate.user";

export const saveToken = (t) => localStorage.setItem(KEY, t);
export const loadToken = () => localStorage.getItem(KEY);
export const clearToken = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
};
export const saveUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const loadUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
