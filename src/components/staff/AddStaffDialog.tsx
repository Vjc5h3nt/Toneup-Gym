import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const staffSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email required'),
  phone: z.string().trim().max(15).optional(),
  role: z.enum(['trainer', 'manager', 'receptionist', 'admin']),
  specialization: z.string().max(200).optional(),
  salary: z.number().min(0).optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

const roles = [
  { value: 'trainer', label: 'Trainer' },
  { value: 'manager', label: 'Manager' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'admin', label: 'Admin' },
];

export default function AddStaffDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddStaffDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<StaffFormData>>({
    role: 'trainer',
  });
  const [permissions, setPermissions] = useState({
    can_view_members: true,
    can_edit_members: false,
    can_manage_leads: true,
    can_view_reports: false,
    can_manage_payroll: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = staffSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('staff').insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      role: result.data.role,
      specialization: result.data.specialization || null,
      salary: result.data.salary || 0,
      ...permissions,
    });

    if (error) {
      toast.error('Failed to add staff');
    } else {
      toast.success('Staff added successfully');
      setFormData({ role: 'trainer' });
      onOpenChange(false);
      onSuccess();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary (₹)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ''}
                onChange={(e) =>
                  setFormData({ ...formData, salary: Number(e.target.value) })
                }
                placeholder="Monthly salary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization || ''}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              placeholder="e.g., Weight Training, Yoga"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">Permissions</Label>
            <div className="space-y-2">
              {[
                { key: 'can_view_members', label: 'View Members' },
                { key: 'can_edit_members', label: 'Edit Members' },
                { key: 'can_manage_leads', label: 'Manage Leads' },
                { key: 'can_view_reports', label: 'View Reports' },
                { key: 'can_manage_payroll', label: 'Manage Payroll' },
              ].map((perm) => (
                <div key={perm.key} className="flex items-center justify-between">
                  <Label htmlFor={perm.key} className="text-sm font-normal">
                    {perm.label}
                  </Label>
                  <Switch
                    id={perm.key}
                    checked={permissions[perm.key as keyof typeof permissions]}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, [perm.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gradient-primary">
              {isSubmitting ? 'Adding...' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
