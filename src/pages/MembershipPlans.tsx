import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, CreditCard, Loader2 } from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string | null;
  is_active: boolean;
  is_custom: boolean;
  created_at: string;
}

const MembershipPlans = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration_months: 1,
    price: 0,
    description: '',
    is_active: true,
    is_custom: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('duration_months', { ascending: true });

      if (error) throw error;
      setPlans((data as MembershipPlan[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (plan?: MembershipPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        duration_months: plan.duration_months,
        price: plan.price,
        description: plan.description || '',
        is_active: plan.is_active,
        is_custom: plan.is_custom,
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: '',
        duration_months: 1,
        price: 0,
        description: '',
        is_active: true,
        is_custom: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedPlan) {
        const { error } = await supabase
          .from('membership_plans')
          .update({
            name: formData.name,
            duration_months: formData.duration_months,
            price: formData.price,
            description: formData.description || null,
            is_active: formData.is_active,
            is_custom: formData.is_custom,
          })
          .eq('id', selectedPlan.id);

        if (error) throw error;
        toast({ title: 'Plan Updated', description: 'Membership plan updated successfully' });
      } else {
        const { error } = await supabase.from('membership_plans').insert({
          name: formData.name,
          duration_months: formData.duration_months,
          price: formData.price,
          description: formData.description || null,
          is_active: formData.is_active,
          is_custom: formData.is_custom,
        });

        if (error) throw error;
        toast({ title: 'Plan Created', description: 'New membership plan created successfully' });
      }

      setDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save plan',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: MembershipPlan) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      
      toast({
        title: plan.is_active ? 'Plan Disabled' : 'Plan Enabled',
        description: `${plan.name} has been ${plan.is_active ? 'disabled' : 'enabled'}`,
      });
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update plan',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedPlan) return;

    try {
      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', selectedPlan.id);

      if (error) throw error;
      
      toast({ title: 'Plan Deleted', description: 'Membership plan deleted successfully' });
      setDeleteDialogOpen(false);
      setSelectedPlan(null);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Membership Plans</h1>
          <p className="text-muted-foreground">Manage gym membership plans and pricing</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{selectedPlan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
                <DialogDescription>
                  {selectedPlan ? 'Update membership plan details' : 'Create a new membership plan'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 3 Months Plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (Months) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Plan features and benefits"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_custom"
                      checked={formData.is_custom}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_custom: checked })}
                    />
                    <Label htmlFor="is_custom">Custom Plan</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedPlan ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Plans Grid for Quick Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.filter(p => p.is_active).map((plan) => (
          <Card key={plan.id} className="relative">
            {plan.duration_months === 12 && (
              <Badge className="absolute -top-2 -right-2 bg-primary">Best Value</Badge>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString()}</div>
              {plan.duration_months > 1 && (
                <p className="text-sm text-muted-foreground">
                  ₹{Math.round(plan.price / plan.duration_months).toLocaleString()}/month
                </p>
              )}
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{plan.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Plans
          </CardTitle>
          <CardDescription>View and manage all membership plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Per Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</TableCell>
                  <TableCell>₹{plan.price.toLocaleString()}</TableCell>
                  <TableCell>₹{Math.round(plan.price / plan.duration_months).toLocaleString()}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => handleToggleActive(plan)}
                      />
                    ) : (
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.is_custom ? 'Custom' : 'Standard'}</Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground py-8">
                    No membership plans found. Add your first plan to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MembershipPlans;
