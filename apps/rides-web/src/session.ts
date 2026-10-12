const KEY = 'rides_user';

export const saveUser = (name: string) => localStorage.setItem(KEY, name);
export const loadUser = (): string => localStorage.getItem(KEY) ?? 'Staff';
export const clearUser = () => localStorage.removeItem(KEY);
