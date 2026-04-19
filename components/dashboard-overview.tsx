'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Stats {
  total_balance: number
  total_income: number
  total_expense: number
}

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  date: string
  description: string | null
}

interface CategoryData {
  name: string
  value: number
}

export function DashboardOverview({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const { data: transData, error: transError } = await supabase
          .from('transactions')
          .select('*')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('date', { ascending: false })
          .limit(10)

        if (transError) throw transError
        setTransactions(transData || [])

        // Calculate stats
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_user_stats', { user_id: userId })

        if (statsError) throw statsError
        if (statsData && statsData.length > 0) {
          setStats(statsData[0])
        }

        // Prepare category data for pie chart
        if (transData) {
          const categoryMap = new Map<string, number>()
          transData.forEach((trans) => {
            const type = trans.type === 'income' ? 'Income' : 'Expense'
            categoryMap.set(type, (categoryMap.get(type) || 0) + Number(trans.amount))
          })
          setCategoryData(
            Array.from(categoryMap, ([name, value]) => ({
              name,
              value: Number(value.toFixed(2)),
            }))
          )
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId, supabase])

  // Prepare data for line chart
  const chartData = transactions
    .slice()
    .reverse()
    .map((trans, idx) => ({
      date: new Date(trans.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: trans.amount,
      cumulative: (idx + 1) * (trans.type === 'income' ? Number(trans.amount) : -Number(trans.amount)),
    }))

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
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
            <div className="text-2xl font-bold">
              ${stats?.total_balance?.toFixed(2) || '0.00'}
            </div>
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
  )
}
