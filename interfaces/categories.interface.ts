export interface ICategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id: string;
}

export interface ICategoryInput {
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface ICategoryData {
  name: string;
  value: number;
}
