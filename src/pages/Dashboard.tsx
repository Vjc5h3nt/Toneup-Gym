import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, DollarSign, UserCheck, UserX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newLeadsToday: number;
  conversionsThisMonth: number;
  todayCollection: number;
}

const COLORS = ['hsl(24, 95%, 53%)', 'hsl(174, 72%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    newLeadsToday: 0,
    conversionsThisMonth: 0,
    todayCollection: 0,
  });
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all stats in parallel
      const [
        { count: totalMembers },
        { count: activeMembers },
        { count: expiredMembers },
        { count: newLeadsToday },
        { count: conversionsThisMonth },
        { data: todayPayments },
        { data: last7DaysPayments },
        { data: leadSources },
      ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted').gte('updated_at', startOfMonth),
        supabase.from('payments').select('amount').gte('payment_date', today),
        supabase.from('payments').select('amount, payment_date').gte('payment_date', last7Days),
        supabase.from('leads').select('source'),
      ]);

      // Calculate today's collection
      const todayTotal = todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Process revenue data for last 7 days
      const revenueByDate: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        revenueByDate[dateStr] = 0;
      }
      last7DaysPayments?.forEach((p) => {
        if (revenueByDate[p.payment_date] !== undefined) {
          revenueByDate[p.payment_date] += Number(p.amount);
        }
      });
      const formattedRevenueData = Object.entries(revenueByDate).map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
      }));

      // Process lead sources
      const sourceCount: Record<string, number> = {};
      leadSources?.forEach((l) => {
        const source = l.source || 'other';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
      });
      const formattedSourceData = Object.entries(sourceCount).map(([name, value]) => ({
        name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
        value,
      }));

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        expiredMembers: expiredMembers || 0,
        newLeadsToday: newLeadsToday || 0,
        conversionsThisMonth: conversionsThisMonth || 0,
        todayCollection: todayTotal,
      });
      setRevenueData(formattedRevenueData);
      setSourceData(formattedSourceData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-primary' },
    { title: 'Active Members', value: stats.activeMembers, icon: UserCheck, color: 'text-success' },
    { title: 'Expired Members', value: stats.expiredMembers, icon: UserX, color: 'text-destructive' },
    { title: 'New Leads Today', value: stats.newLeadsToday, icon: UserPlus, color: 'text-info' },
    { title: 'Conversions (Month)', value: stats.conversionsThisMonth, icon: TrendingUp, color: 'text-accent' },
    { title: "Today's Collection", value: `₹${stats.todayCollection.toLocaleString()}`, icon: DollarSign, color: 'text-warning' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your gym analytics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your gym overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="amount" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lead Sources Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {sourceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No lead data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
