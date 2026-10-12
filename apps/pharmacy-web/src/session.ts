const KEY = 'pharmacy_user';

export const saveUser = (name: string) => localStorage.setItem(KEY, name);
export const loadUser = (): string => localStorage.getItem(KEY) ?? 'Pharmacist';
export const clearUser = () => localStorage.removeItem(KEY);
