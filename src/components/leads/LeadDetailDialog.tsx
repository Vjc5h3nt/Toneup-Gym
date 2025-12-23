import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lead, LeadNote } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Phone,
  Mail,
  Calendar,
  Target,
  Clock,
  User,
  MessageSquare,
  Send,
} from 'lucide-react';

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const statusFlow: Record<string, string[]> = {
  new: ['contacted'],
  contacted: ['hot', 'warm', 'cold'],
  hot: ['converted', 'warm', 'cold', 'lost'],
  warm: ['hot', 'cold', 'converted', 'lost'],
  cold: ['warm', 'lost'],
  converted: [],
  lost: [],
};

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

export default function LeadDetailDialog({
  lead,
  open,
  onOpenChange,
  onUpdate,
}: LeadDetailDialogProps) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const fetchNotes = async (leadId: string) => {
    setIsLoadingNotes(true);
    const { data, error } = await supabase
      .from('lead_notes')
      .select('*, staff:staff(name)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotes(data as LeadNote[]);
    }
    setIsLoadingNotes(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && lead) {
      fetchNotes(lead.id);
      setFollowUpDate(lead.next_follow_up || '');
    } else {
      setNotes([]);
      setNewNote('');
      setFollowUpDate('');
    }
    onOpenChange(isOpen);
  };

  const updateStatus = async (newStatus: string) => {
    if (!lead) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus as 'new' | 'contacted' | 'hot' | 'warm' | 'cold' | 'converted' | 'lost' })
      .eq('id', lead.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to ${statusLabels[newStatus]}`);
      onUpdate();
    }
    setIsUpdating(false);
  };

  const updateFollowUp = async () => {
    if (!lead) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('leads')
      .update({ next_follow_up: followUpDate || null })
      .eq('id', lead.id);

    if (error) {
      toast.error('Failed to update follow-up date');
    } else {
      toast.success('Follow-up date updated');
      onUpdate();
    }
    setIsUpdating(false);
  };

  const addNote = async () => {
    if (!lead || !newNote.trim()) return;
    setIsUpdating(true);

    const { error } = await supabase.from('lead_notes').insert({
      lead_id: lead.id,
      note: newNote.trim(),
    });

    if (error) {
      toast.error('Failed to add note');
    } else {
      toast.success('Note added');
      setNewNote('');
      fetchNotes(lead.id);
    }
    setIsUpdating(false);
  };

  if (!lead) return null;

  const nextStatuses = statusFlow[lead.status] || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
            <Badge className={`${statusColors[lead.status]} text-sm`}>
              {statusLabels[lead.status]}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                </div>
              )}
              {lead.interest && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{lead.interest.replace('_', ' ')}</span>
                </div>
              )}
              {lead.preferred_call_time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Best time: {lead.preferred_call_time}</span>
                </div>
              )}
              {lead.fitness_goal && (
                <div className="col-span-2 flex items-start gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{lead.fitness_goal}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Status Workflow */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Update Status</Label>
              {nextStatuses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => updateStatus(status)}
                      className={`border-2 hover:${statusColors[status]}`}
                    >
                      Move to {statusLabels[status]}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This lead is {lead.status}. No further status changes available.
                </p>
              )}
            </div>

            <Separator />

            {/* Follow-up Date */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Next Follow-up</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={updateFollowUp}
                  disabled={isUpdating}
                  variant="secondary"
                >
                  Save
                </Button>
              </div>
              {lead.next_follow_up && (
                <p className="text-sm text-muted-foreground">
                  Current: {format(new Date(lead.next_follow_up), 'PPP')}
                </p>
              )}
            </div>

            <Separator />

            {/* Notes Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes & Activity
              </Label>

              {/* Add Note */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note about this lead..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button
                onClick={addNote}
                disabled={isUpdating || !newNote.trim()}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Add Note
              </Button>

              {/* Notes List */}
              <div className="space-y-3 mt-4">
                {isLoadingNotes ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading notes...
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No notes yet. Add your first note above.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border bg-muted/50 p-3 space-y-1"
                    >
                      <p className="text-sm">{note.note}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(note.created_at), 'PPp')}
                        {(note as any).staff?.name && ` • ${(note as any).staff.name}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
