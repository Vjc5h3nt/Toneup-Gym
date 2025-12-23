import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Membership } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AddPaymentDialogProps {
  memberId: string;
  memberships: Membership[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export default function AddPaymentDialog({
  memberId,
  memberships,
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    membership_id: '',
    amount: 0,
    payment_method: 'cash',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const handleMembershipChange = (membershipId: string) => {
    const selected = memberships.find((m) => m.id === membershipId);
    setFormData({
      ...formData,
      membership_id: membershipId === 'none' ? '' : membershipId,
      amount: selected?.price || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('payments').insert({
      member_id: memberId,
      membership_id: formData.membership_id || null,
      amount: formData.amount,
      payment_method: formData.payment_method as any,
      payment_date: formData.payment_date,
      notes: formData.notes || null,
    });

    if (error) {
      toast.error('Failed to record payment');
    } else {
      toast.success('Payment recorded');
      setFormData({
        membership_id: '',
        amount: 0,
        payment_method: 'cash',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      onOpenChange(false);
      onSuccess();
    }
    setIsSubmitting(false);
  };

  const activeMemberships = memberships.filter((m) => m.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeMemberships.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Membership (optional)</Label>
              <Select
                value={formData.membership_id}
                onValueChange={handleMembershipChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No membership</SelectItem>
                  {activeMemberships.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.type.replace('_', ' ')} - ₹{m.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) =>
                setFormData({ ...formData, payment_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Payment notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-primary">
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
