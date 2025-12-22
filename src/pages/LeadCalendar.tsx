import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
} from 'date-fns';
import LeadDetailDialog from '@/components/leads/LeadDetailDialog';

const statusColors: Record<string, string> = {
  new: 'bg-info border-info',
  contacted: 'bg-warning border-warning',
  hot: 'bg-destructive border-destructive',
  warm: 'bg-primary border-primary',
  cold: 'bg-muted border-muted-foreground',
  converted: 'bg-success border-success',
  lost: 'bg-muted border-muted-foreground',
};

const statusTextColors: Record<string, string> = {
  new: 'text-info-foreground',
  contacted: 'text-warning-foreground',
  hot: 'text-destructive-foreground',
  warm: 'text-primary-foreground',
  cold: 'text-muted-foreground',
  converted: 'text-success-foreground',
  lost: 'text-muted-foreground',
};

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export default function LeadCalendar() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*, assigned_staff:staff(name)')
      .not('next_follow_up', 'is', null)
      .order('next_follow_up', { ascending: true });

    if (error) {
      toast.error('Failed to fetch leads');
    } else {
      setLeads(data as Lead[]);
    }
    setIsLoading(false);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getLeadsForDay = (day: Date) => {
    return leads.filter((lead) => {
      if (!lead.next_follow_up) return false;
      return isSameDay(parseISO(lead.next_follow_up), day);
    });
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const goToToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Calendar</h1>
          <p className="text-muted-foreground">Follow-up schedule for leads</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month/Year Header */}
      <div className="text-2xl font-bold">
        {format(currentWeek, 'MMMM yyyy')}
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-3 text-sm font-medium text-muted-foreground border-r">
                  Time
                </div>
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-3 text-center border-r last:border-r-0 ${
                        isToday ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-xl font-bold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[80px]">
                  <div className="p-2 text-sm text-muted-foreground border-r flex items-start justify-center">
                    {time}
                  </div>
                  {weekDays.map((day) => {
                    const dayLeads = getLeadsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-1 border-r last:border-r-0 ${
                          isToday ? 'bg-primary/5' : ''
                        }`}
                      >
                        {/* Show leads only in first time slot for simplicity */}
                        {time === '09:00' &&
                          dayLeads.slice(0, 3).map((lead) => (
                            <button
                              key={lead.id}
                              onClick={() => handleLeadClick(lead)}
                              className={`w-full mb-1 p-2 rounded-md text-left transition-all hover:scale-[1.02] hover:shadow-md ${
                                statusColors[lead.status]
                              } ${statusTextColors[lead.status]}`}
                            >
                              <div className="text-xs font-semibold truncate">
                                {lead.name}
                              </div>
                              <div className="text-[10px] opacity-80 truncate">
                                {lead.phone}
                              </div>
                              {lead.preferred_call_time && (
                                <div className="text-[10px] opacity-70 truncate">
                                  {lead.preferred_call_time}
                                </div>
                              )}
                            </button>
                          ))}
                        {time === '09:00' && dayLeads.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayLeads.length - 3} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {['new', 'contacted', 'hot', 'warm', 'cold', 'converted', 'lost'].map((status) => (
          <Badge key={status} className={`${statusColors[status]} ${statusTextColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        ))}
      </div>

      {/* Leads without follow-up */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Leads Without Follow-up Date</h3>
        <div className="text-sm text-muted-foreground">
          {leads.length === 0 ? (
            'No leads with follow-up dates. Set follow-up dates on leads to see them on the calendar.'
          ) : (
            'Showing only leads with scheduled follow-ups.'
          )}
        </div>
      </Card>

      <LeadDetailDialog
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={fetchLeads}
      />
    </div>
  );
}
