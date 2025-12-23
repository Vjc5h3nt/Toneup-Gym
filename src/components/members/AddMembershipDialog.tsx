import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { addMonths, format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string | null;
  is_active: boolean;
}

interface AddMembershipDialogProps {
  memberId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddMembershipDialog({
  memberId,
  open,
  onOpenChange,
  onSuccess,
}: AddMembershipDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [formData, setFormData] = useState({
    plan_id: '',
    price: 0,
    duration_months: 1,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('duration_months', { ascending: true });

      if (error) throw error;
      
      const plansData = (data as MembershipPlan[]) || [];
      setPlans(plansData);
      
      // Set default selection to first plan
      if (plansData.length > 0) {
        setFormData(prev => ({
          ...prev,
          plan_id: plansData[0].id,
          price: plansData[0].price,
          duration_months: plansData[0].duration_months,
        }));
      }
    } catch (error) {
      toast.error('Failed to load membership plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = (planId: string) => {
    const selected = plans.find((p) => p.id === planId);
    if (selected) {
      setFormData({
        ...formData,
        plan_id: planId,
        price: selected.price,
        duration_months: selected.duration_months,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan_id) {
      toast.error('Please select a membership plan');
      return;
    }

    setIsSubmitting(true);

    const startDate = new Date(formData.start_date);
    const endDate = addMonths(startDate, formData.duration_months);

    const { error } = await supabase.from('memberships').insert({
      member_id: memberId,
      type: 'normal', // Default type for now
      start_date: formData.start_date,
      end_date: format(endDate, 'yyyy-MM-dd'),
      price: formData.price,
      status: 'active',
      notes: formData.notes || null,
    });

    if (error) {
      toast.error('Failed to add membership');
    } else {
      toast.success('Membership added');
      setFormData({
        plan_id: plans[0]?.id || '',
        price: plans[0]?.price || 0,
        duration_months: plans[0]?.duration_months || 1,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      onOpenChange(false);
      onSuccess();
    }
    setIsSubmitting(false);
  };

  const endDate = addMonths(new Date(formData.start_date), formData.duration_months);
  const selectedPlan = plans.find(p => p.id === formData.plan_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Membership</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active membership plans available.</p>
            <p className="text-sm mt-1">Please add plans in Manage Plans section.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Membership Plan</Label>
              <Select value={formData.plan_id} onValueChange={handlePlanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price.toLocaleString()} ({plan.duration_months} month{plan.duration_months > 1 ? 's' : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan?.description && (
                <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Total Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                You can adjust the price if needed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special notes..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gradient-primary">
                {isSubmitting ? 'Adding...' : 'Add Membership'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
