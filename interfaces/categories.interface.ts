export interface ICategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id: string;
  type_id?: string;
}

export interface ICategoryInput {
  name: string;
  type: 'income' | 'expense';
  color: string;
  type_id?: string;
}

export interface ICategoryData {
  name: string;
  value: number;
}

export interface ICategoryType {
  id: string;
  name: string;
}
