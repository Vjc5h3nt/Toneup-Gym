import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  new: 'bg-info text-info-foreground',
  contacted: 'bg-warning text-warning-foreground',
  hot: 'bg-destructive text-destructive-foreground',
  warm: 'bg-primary text-primary-foreground',
  cold: 'bg-muted text-muted-foreground',
  converted: 'bg-success text-success-foreground',
  lost: 'bg-muted text-muted-foreground',
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*, assigned_staff:staff(name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch leads');
    } else {
      setLeads(data as Lead[]);
    }
    setIsLoading(false);
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage gym enquiries and follow-ups</p>
        </div>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-32 rounded bg-muted mb-2" />
                <div className="h-3 w-24 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No leads found. Add your first lead to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
                {lead.email && <p className="text-sm text-muted-foreground">{lead.email}</p>}
                <p className="mt-2 text-xs text-muted-foreground capitalize">
                  Source: {lead.source?.replace('_', ' ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
