export interface ICategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  type_id?: string;
}

export interface ICategoryData {
  name: string;
  value: number;
}

export interface ICategoryType {
  id: string;
  name: string;
  icon?: string;
}

export interface ICategoryTypeInput {
  name: string;
  icon?: string;
}
