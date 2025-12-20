
import { User } from './types';

export const STORAGE_KEY = 'packpro_data_v1';

export const DEFAULT_ITEMS = [
  { name: 'T-Shirts', target: 5 },
  { name: 'Socks', target: 7 },
  { name: 'Toothbrush', target: 1 },
  { name: 'Sunscreen', target: 1 },
  { name: 'Passport', target: 1 },
  { name: 'Chargers', target: 2 }
];

export const generateId = () => Math.random().toString(36).substr(2, 9);
