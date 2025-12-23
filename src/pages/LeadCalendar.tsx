import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users } from 'lucide-react';
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
  converted: 'bg-success border-success',
  lost: 'bg-muted border-muted-foreground',
};

const statusTextColors: Record<string, string> = {
  new: 'text-info-foreground',
  contacted: 'text-warning-foreground',
  converted: 'text-success-foreground',
  lost: 'text-muted-foreground',
};

// Generate 30-minute time slots from 6:00 AM to 10:00 PM
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    slots.push(`${hourStr}:00`);
    if (hour < 22) {
      slots.push(`${hourStr}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();
const MAX_SLOTS_PER_TIME = 5;

const formatTimeDisplay = (time: string) => {
  const [hours] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${time.split(':')[1]} ${period}`;
};

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
    // Fetch leads with follow-up dates OR enquiries with preferred_call_time
    const { data, error } = await supabase
      .from('leads')
      .select('*, assigned_staff:staff(name)')
      .or('next_follow_up.not.is.null,preferred_call_time.not.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch leads');
    } else {
      setLeads(data as Lead[]);
    }
    setIsLoading(false);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Get leads for a specific day and time slot
  const getLeadsForDayAndTime = (day: Date, timeSlot: string) => {
    return leads.filter((lead) => {
      // Check if lead has a follow-up on this day
      if (lead.next_follow_up && isSameDay(parseISO(lead.next_follow_up), day)) {
        // If lead has preferred_call_time matching this slot, show in that slot
        if (lead.preferred_call_time === timeSlot) {
          return true;
        }
        // If no preferred time but has follow-up on this day, show in first slot only
        if (!lead.preferred_call_time && timeSlot === '09:00') {
          return true;
        }
      }
      
      // For new enquiries with preferred_call_time but no follow_up set yet
      // Show them on today's date in their preferred time slot
      if (lead.is_enquiry && lead.preferred_call_time === timeSlot && !lead.next_follow_up) {
        const createdDate = parseISO(lead.created_at);
        if (isSameDay(createdDate, day)) {
          return true;
        }
      }
      
      return false;
    });
  };

  // Count total leads for a time slot across the week
  const getSlotCount = (day: Date, timeSlot: string) => {
    return getLeadsForDayAndTime(day, timeSlot).length;
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
          <p className="text-muted-foreground">Follow-up schedule with 30-minute time slots (max {MAX_SLOTS_PER_TIME} per slot)</p>
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
            <div className="min-w-[900px]">
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
                <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                  <div className="p-2 text-xs text-muted-foreground border-r flex items-start justify-center font-medium">
                    {formatTimeDisplay(time)}
                  </div>
                  {weekDays.map((day) => {
                    const dayLeads = getLeadsForDayAndTime(day, time);
                    const isToday = isSameDay(day, new Date());
                    const slotCount = dayLeads.length;
                    const isFull = slotCount >= MAX_SLOTS_PER_TIME;
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-1 border-r last:border-r-0 ${
                          isToday ? 'bg-primary/5' : ''
                        } ${isFull ? 'bg-destructive/10' : ''}`}
                      >
                        {dayLeads.slice(0, 3).map((lead) => (
                          <button
                            key={lead.id}
                            onClick={() => handleLeadClick(lead)}
                            className={`w-full mb-1 p-1.5 rounded-md text-left transition-all hover:scale-[1.02] hover:shadow-md ${
                              statusColors[lead.status || 'new']
                            } ${statusTextColors[lead.status || 'new']}`}
                          >
                            <div className="text-[10px] font-semibold truncate">
                              {lead.name}
                            </div>
                            <div className="text-[9px] opacity-80 truncate">
                              {lead.phone}
                            </div>
                          </button>
                        ))}
                        {slotCount > 3 && (
                          <div className="text-[10px] text-muted-foreground text-center py-0.5 flex items-center justify-center gap-1">
                            <Users className="h-3 w-3" />
                            +{slotCount - 3} more
                          </div>
                        )}
                        {slotCount > 0 && (
                          <div className={`text-[9px] text-center mt-0.5 ${isFull ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            {slotCount}/{MAX_SLOTS_PER_TIME}
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
        {['new', 'contacted', 'converted', 'lost'].map((status) => (
          <Badge key={status} className={`${statusColors[status]} ${statusTextColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        ))}
        <Badge variant="outline" className="bg-destructive/10 border-destructive text-destructive">
          Slot Full ({MAX_SLOTS_PER_TIME}/{MAX_SLOTS_PER_TIME})
        </Badge>
      </div>

      {/* Summary */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Calendar Info</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Leads with follow-up dates appear on their scheduled day</p>
          <p>• New enquiries appear on their creation date in their preferred time slot</p>
          <p>• Each time slot can accommodate up to {MAX_SLOTS_PER_TIME} calls</p>
          <p>• Red background indicates a full slot</p>
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
