
import { AppData, User } from '../types';
import { STORAGE_KEY } from '../constants';

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadAppData = (): AppData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse app data", e);
    }
  }
  return {
    users: [],
    currentUserId: null
  };
};

export const exportDataAsJSON = (data: any, fileName: string) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = fileName;
  link.click();
};
