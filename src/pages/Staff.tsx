import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Staff } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, User, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import StaffDetailDialog from '@/components/staff/StaffDetailDialog';
import AddStaffDialog from '@/components/staff/AddStaffDialog';
import PayrollDialog from '@/components/staff/PayrollDialog';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch staff');
    } else {
      setStaff(data as Staff[]);
    }
    setIsLoading(false);
  };

  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleStaffClick = (s: Staff) => {
    setSelectedStaff(s);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage trainers and staff members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPayrollOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" /> Payroll
          </Button>
          <Button className="gradient-primary" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-sm text-muted-foreground">Total Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-success">
              {staff.filter((s) => s.is_active).length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {staff.filter((s) => s.role === 'trainer').length}
            </div>
            <p className="text-sm text-muted-foreground">Trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              ₹{staff.reduce((sum, s) => sum + (s.salary || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Salaries</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
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
      ) : filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No staff found. Add your first staff member to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((s) => (
            <Card
              key={s.id}
              className="transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              onClick={() => handleStaffClick(s)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">{s.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{s.email}</p>
                {s.specialization && (
                  <p className="text-xs text-muted-foreground">{s.specialization}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Badge variant={s.is_active ? 'default' : 'secondary'}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {s.salary && (
                    <span className="text-sm text-muted-foreground">
                      ₹{s.salary.toLocaleString()}/mo
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StaffDetailDialog
        staff={selectedStaff}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={fetchStaff}
      />

      <AddStaffDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={fetchStaff} />

      <PayrollDialog open={payrollOpen} onOpenChange={setPayrollOpen} />
    </div>
  );
}
