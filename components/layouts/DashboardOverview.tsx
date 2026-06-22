'use client';

import { type FC, useMemo } from 'react';

import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import type { PieLabelRenderProps } from 'recharts';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/shadcn';

import type { IStats, ITransaction } from '@/interfaces';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

interface IDashboardOverview {
  transactions: ITransaction[];
  stats: IStats | null;
  statsError?: string;
}

export const DashboardOverview: FC<IDashboardOverview> = ({ transactions, stats, statsError }) => {
  const incomeExpenseData = useMemo(() => {
    const typeMap = new Map<string, number>();
    transactions.forEach((trans) => {
      const type = trans.type === 'income' ? 'Income' : 'Expense';
      typeMap.set(type, (typeMap.get(type) || 0) + Number(trans.amount));
    });
    return Array.from(typeMap, ([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [transactions]);

  const chartData = useMemo(
    () =>
      transactions
        .slice()
        .reverse()
        .map((trans) => ({
          date: new Date(trans.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          amount: trans.amount,
        })),
    [transactions]
  );

  return (
    <div className="grid gap-6">
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
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${stats?.total_income?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Income received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${stats?.total_expense?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total spent</p>
          </CardContent>
        </Card>
      </div>

      {statsError && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
          {statsError}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Distribution of your transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {incomeExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeExpenseData}
                    cx="40%"
                    cy="50%"
                    labelLine={false}
                    label={(props: PieLabelRenderProps) => {
                      const x = Number(props.x);
                      const y = Number(props.y);
                      const cx = Number(props.cx);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="var(--foreground)"
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="middle"
                          className="text-xs font-medium"
                        >
                          {props.name ?? ''}: ${props.value ?? 0}
                        </text>
                      );
                    }}
                    outerRadius={60}
                    fill="var(--chart-5)"
                    dataKey="value"
                  >
                    {incomeExpenseData.map((_entry, index) => (
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
                    stroke="var(--chart-3)"
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
