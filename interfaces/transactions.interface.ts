export interface ITransaction {
  id: string;
  amount: number;
  currency_id: string;
  exchange_rate: number;
  amount_usd: number;
  type: 'income' | 'expense';
  date: string;
  description: string | null;
  category_id: string | null;
  sender_id: string;
  receiver_id: string;
}
