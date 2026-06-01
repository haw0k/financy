'use client';

import { type FC, useEffect, useState } from 'react';
import { showError } from '@/components/ui';
import { getDashboardDataAction } from '@/app/actions/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { ITransaction, IStats, ICategoryData } from '@/interfaces';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const DashboardOverview: FC = () => {
  const [stats, setStats] = useState<IStats | null>(null);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [categoryData, setCategoryData] = useState<ICategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const result = await getDashboardDataAction();

      if (isCancelled) return;

      if (!result.isSuccess) {
        showError('Dashboard', result.error);
        setIsLoading(false);
        return;
      }

      setTransactions(result.data.transactions as ITransaction[]);
      setStats(result.data.stats as IStats);

      // Prepare category data for pie chart
      const categoryMap = new Map<string, number>();
      result.data.transactions.forEach((trans) => {
        const type = trans.type === 'income' ? 'Income' : 'Expense';
        categoryMap.set(type, (categoryMap.get(type) || 0) + Number(trans.amount));
      });
      setCategoryData(
        Array.from(categoryMap, ([name, value]) => ({
          name,
          value: Number(value.toFixed(2)),
        }))
      );

      setIsLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Prepare data for line chart
  const chartData = transactions
    .slice()
    .reverse()
    .map((trans, idx) => ({
      date: new Date(trans.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: trans.amount,
      cumulative:
        (idx + 1) * (trans.type === 'income' ? Number(trans.amount) : -Number(trans.amount)),
    }));

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_balance?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Your total balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats?.total_income?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Income received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${stats?.total_expense?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Distribution of your transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: $${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Trend</CardTitle>
            <CardDescription>Last 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    name="Amount"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
