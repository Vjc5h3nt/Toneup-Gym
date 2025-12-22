import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

export function useRealtimeNotifications() {
  const hasCheckedExpiring = useRef(false);

  useEffect(() => {
    // Subscribe to new leads
    const leadsChannel = supabase
      .channel('leads-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const lead = payload.new as { name: string; source: string; phone: string };
          console.log('New lead received:', lead);
          toast.info(`New Lead: ${lead.name}`, {
            description: `Source: ${lead.source?.replace('_', ' ') || 'Unknown'} • ${lead.phone}`,
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/leads',
            },
          });
        }
      )
      .subscribe((status) => {
        console.log('Leads channel status:', status);
      });

    // Check for expiring memberships on mount
    if (!hasCheckedExpiring.current) {
      hasCheckedExpiring.current = true;
      checkExpiringMemberships();
    }

    return () => {
      supabase.removeChannel(leadsChannel);
    };
  }, []);

  const checkExpiringMemberships = async () => {
    try {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      const { data: expiringMemberships, error } = await supabase
        .from('memberships')
        .select(`
          id, end_date, type,
          members!inner(name)
        `)
        .eq('status', 'active')
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', threeDaysFromNow.toISOString().split('T')[0]);

      if (error) {
        console.error('Error checking expiring memberships:', error);
        return;
      }

      if (expiringMemberships && expiringMemberships.length > 0) {
        // Group by days until expiry
        const expiringToday = expiringMemberships.filter(
          (m) => differenceInDays(new Date(m.end_date), today) === 0
        );
        const expiringSoon = expiringMemberships.filter(
          (m) => differenceInDays(new Date(m.end_date), today) > 0
        );

        if (expiringToday.length > 0) {
          toast.warning(`${expiringToday.length} membership(s) expiring today!`, {
            description: expiringToday.slice(0, 3).map((m) => (m.members as any)?.name).join(', ') + 
              (expiringToday.length > 3 ? ` and ${expiringToday.length - 3} more` : ''),
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/members',
            },
          });
        }

        if (expiringSoon.length > 0) {
          toast.info(`${expiringSoon.length} membership(s) expiring in 1-3 days`, {
            description: expiringSoon.slice(0, 3).map((m) => (m.members as any)?.name).join(', ') +
              (expiringSoon.length > 3 ? ` and ${expiringSoon.length - 3} more` : ''),
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/members',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error in checkExpiringMemberships:', error);
    }
  };
}
