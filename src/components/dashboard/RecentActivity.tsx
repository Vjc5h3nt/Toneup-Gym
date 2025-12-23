import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, CreditCard, Users, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'member' | 'payment' | 'lead' | 'attendance';
  message: string;
  timestamp: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const [
        { data: members },
        { data: payments },
        { data: leads },
        { data: attendance },
      ] = await Promise.all([
        supabase.from('members').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('payments').select('id, amount, payment_date, members(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('leads').select('id, name, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('member_attendance').select('id, check_in_time, members(name)').order('check_in_time', { ascending: false }).limit(5),
      ]);

      const allActivities: ActivityItem[] = [];

      members?.forEach((m) => {
        allActivities.push({
          id: `member-${m.id}`,
          type: 'member',
          message: `New member: ${m.name}`,
          timestamp: m.created_at,
        });
      });

      payments?.forEach((p) => {
        const memberName = (p.members as any)?.name || 'Unknown';
        allActivities.push({
          id: `payment-${p.id}`,
          type: 'payment',
          message: `₹${Number(p.amount).toLocaleString()} received from ${memberName}`,
          timestamp: p.payment_date,
        });
      });

      leads?.forEach((l) => {
        allActivities.push({
          id: `lead-${l.id}`,
          type: 'lead',
          message: `New lead: ${l.name}`,
          timestamp: l.created_at,
        });
      });

      attendance?.forEach((a) => {
        const memberName = (a.members as any)?.name || 'Unknown';
        allActivities.push({
          id: `attendance-${a.id}`,
          type: 'attendance',
          message: `${memberName} checked in`,
          timestamp: a.check_in_time,
        });
      });

      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member': return UserPlus;
      case 'payment': return CreditCard;
      case 'lead': return Users;
      case 'attendance': return Activity;
    }
  };

  const getColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'payment': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'lead': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'attendance': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`rounded-full p-2 ${getColor(activity.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
