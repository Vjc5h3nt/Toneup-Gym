import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lead } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import LeadDetailDialog from '@/components/leads/LeadDetailDialog';
import AddLeadDialog from '@/components/leads/AddLeadDialog';

const statusColors: Record<string, string> = {
  new: 'bg-info text-info-foreground',
  contacted: 'bg-warning text-warning-foreground',
  hot: 'bg-destructive text-destructive-foreground',
  warm: 'bg-amber-500 text-white',
  cold: 'bg-sky-600 text-white',
  converted: 'bg-success text-success-foreground',
  lost: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  hot: 'Hot 🔥',
  warm: 'Warm',
  cold: 'Cold',
  converted: 'Converted ✓',
  lost: 'Lost',
};

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailOpen(true);
  };

  const handleUpdate = () => {
    fetchLeads();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage gym enquiries and follow-ups</p>
        </div>
        <Button className="gradient-primary" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {['new', 'contacted', 'hot', 'warm', 'cold', 'converted', 'lost'].map((status) => {
          const count = leads.filter((l) => l.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
              className={`rounded-lg p-3 text-center transition-all ${
                status === statusFilter
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="text-2xl font-bold">{count}</div>
              <Badge className={`${statusColors[status]} text-xs`}>
                {statusLabels[status]}
              </Badge>
            </button>
          );
        })}
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
            <p className="text-muted-foreground">
              {leads.length === 0
                ? 'No leads found. Add your first lead to get started!'
                : 'No leads match your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <Card
              key={lead.id}
              className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              onClick={() => handleLeadClick(lead)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <Badge className={statusColors[lead.status]}>
                    {statusLabels[lead.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{lead.phone}</p>
                {lead.email && (
                  <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground capitalize">
                    {lead.source?.replace('_', ' ')}
                  </p>
                  {lead.next_follow_up && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(lead.next_follow_up), 'MMM d')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LeadDetailDialog
        lead={selectedLead}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={handleUpdate}
      />

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={handleUpdate} />
    </div>
  );
}
