import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, DollarSign, UserCheck, UserX, Target, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';

import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingFollowUps } from '@/components/dashboard/UpcomingFollowUps';
import { ExpiringMemberships } from '@/components/dashboard/ExpiringMemberships';
import { subDays, format, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  totalLeads: number;
  hotLeads: number;
  conversions: number;
  totalRevenue: number;
  conversionRate: number;
}

const COLORS = ['hsl(24, 95%, 53%)', 'hsl(174, 72%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(280, 65%, 60%)'];

export default function Dashboard() {
  const [startDate, setStartDate] = useState(subDays(new Date(), 29));
  const [endDate, setEndDate] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalLeads: 0,
    hotLeads: 0,
    conversions: 0,
    totalRevenue: 0,
    conversionRate: 0,
  });
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([]);
  const [membershipData, setMembershipData] = useState<{ name: string; value: number }[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ date: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startStr = format(startOfDay(startDate), 'yyyy-MM-dd');
      const endStr = format(endOfDay(endDate), 'yyyy-MM-dd');

      const [
        { count: totalMembers },
        { count: activeMembers },
        { count: expiredMembers },
        { count: totalLeads },
        { count: hotLeads },
        { count: conversions },
        { data: payments },
        { data: leadSources },
        { data: memberships },
        { data: attendance },
      ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', startStr).lte('created_at', endStr + 'T23:59:59'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'hot'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted').gte('updated_at', startStr).lte('updated_at', endStr + 'T23:59:59'),
        supabase.from('payments').select('amount, payment_date').gte('payment_date', startStr).lte('payment_date', endStr),
        supabase.from('leads').select('source').gte('created_at', startStr).lte('created_at', endStr + 'T23:59:59'),
        supabase.from('memberships').select('type, status'),
        supabase.from('member_attendance').select('check_in_time').gte('check_in_time', startStr).lte('check_in_time', endStr + 'T23:59:59'),
      ]);

      // Calculate total revenue
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Process revenue data by date
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const revenueByDate: Record<string, number> = {};
      days.forEach((d) => {
        revenueByDate[format(d, 'yyyy-MM-dd')] = 0;
      });
      payments?.forEach((p) => {
        if (revenueByDate[p.payment_date] !== undefined) {
          revenueByDate[p.payment_date] += Number(p.amount);
        }
      });
      const formattedRevenueData = Object.entries(revenueByDate).map(([date, amount]) => ({
        date: format(new Date(date), days.length > 14 ? 'MMM d' : 'EEE'),
        amount,
      }));

      // Process lead sources
      const sourceCount: Record<string, number> = {};
      leadSources?.forEach((l) => {
        const source = l.source || 'other';
        sourceCount[source] = (sourceCount[source] || 0) + 1;
      });
      const formattedSourceData = Object.entries(sourceCount).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()),
        value,
      }));

      // Process membership types
      const typeCount: Record<string, number> = {};
      memberships?.forEach((m) => {
        const type = m.type || 'normal';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      const formattedMembershipData = Object.entries(typeCount).map(([name, value]) => ({
        name: name.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()),
        value,
      }));

      // Process attendance data
      const attendanceByDate: Record<string, number> = {};
      days.forEach((d) => {
        attendanceByDate[format(d, 'yyyy-MM-dd')] = 0;
      });
      attendance?.forEach((a) => {
        const date = format(new Date(a.check_in_time), 'yyyy-MM-dd');
        if (attendanceByDate[date] !== undefined) {
          attendanceByDate[date]++;
        }
      });
      const formattedAttendanceData = Object.entries(attendanceByDate).map(([date, count]) => ({
        date: format(new Date(date), days.length > 14 ? 'MMM d' : 'EEE'),
        count,
      }));

      // Calculate conversion rate
      const conversionRate = totalLeads ? ((conversions || 0) / (totalLeads || 1)) * 100 : 0;

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        expiredMembers: expiredMembers || 0,
        totalLeads: totalLeads || 0,
        hotLeads: hotLeads || 0,
        conversions: conversions || 0,
        totalRevenue,
        conversionRate,
      });
      setRevenueData(formattedRevenueData);
      setSourceData(formattedSourceData);
      setMembershipData(formattedMembershipData);
      setAttendanceData(formattedAttendanceData);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching dashboard data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'text-primary' },
    { title: 'Active Memberships', value: stats.activeMembers, icon: UserCheck, color: 'text-success' },
    { title: 'Expired Memberships', value: stats.expiredMembers, icon: UserX, color: 'text-destructive' },
    { title: 'Total Leads', value: stats.totalLeads, icon: UserPlus, color: 'text-info' },
    { title: 'Hot Leads', value: stats.hotLeads, icon: Target, color: 'text-warning' },
    { title: 'Conversions', value: stats.conversions, icon: TrendingUp, color: 'text-accent' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
    { title: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, icon: Activity, color: 'text-primary' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading your gym analytics...</p>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
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
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your gym overview.</p>
        </div>
        <DateRangeFilter startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
      </div>


      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="hsl(24, 95%, 53%)" fill="url(#revenueGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No revenue data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {attendanceData.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [value, 'Check-ins']}
                    />
                    <Bar dataKey="count" fill="hsl(174, 72%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No attendance data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Sources */}
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

        {/* Membership Types */}
        <Card>
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {membershipData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membershipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {membershipData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
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
                  No membership data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Follow-ups */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentActivity />
        <UpcomingFollowUps />
        <ExpiringMemberships />
      </div>
    </div>
  );
}
