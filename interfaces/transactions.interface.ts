export interface ITransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  description: string | null;
  category_id: string | null;
  sender_id: string;
  receiver_id: string;
}
