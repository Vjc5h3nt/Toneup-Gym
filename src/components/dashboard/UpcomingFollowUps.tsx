import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Calendar, ArrowRight } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  phone: string;
  next_follow_up: string;
  status: string;
}

export function UpcomingFollowUps() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      const { data } = await supabase
        .from('leads')
        .select('id, name, phone, next_follow_up, status')
        .not('next_follow_up', 'is', null)
        .not('status', 'in', '("converted","lost")')
        .order('next_follow_up', { ascending: true })
        .limit(10);

      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date) && !isToday(date)) return { label: 'Overdue', variant: 'destructive' as const };
    if (isToday(date)) return { label: 'Today', variant: 'default' as const };
    if (isTomorrow(date)) return { label: 'Tomorrow', variant: 'secondary' as const };
    return { label: format(date, 'MMM d'), variant: 'outline' as const };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'warm': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'cold': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Follow-ups</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/lead-calendar')}>
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming follow-ups</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => {
                const dateInfo = getDateLabel(lead.next_follow_up);
                return (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/leads')}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                        <Badge variant="outline" className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </div>
                    </div>
                    <Badge variant={dateInfo.variant}>{dateInfo.label}</Badge>
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
