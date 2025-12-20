
export interface Item {
  id: string;
  name: string;
  targetQuantity: number;
  packedQuantity: number;
  isCompleted: boolean;
}

export interface PackingList {
  id: string;
  title: string;
  description: string;
  duration: number;
  destination?: string;
  items: Item[];
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  lists: PackingList[];
}

export interface AppData {
  users: User[];
  currentUserId: string | null;
}
