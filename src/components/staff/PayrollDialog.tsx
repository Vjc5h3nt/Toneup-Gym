import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Staff } from '@/types/database';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

interface PayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Payroll {
  id: string;
  staff_id: string;
  staff?: { name: string };
  month: number;
  year: number;
  basic_salary: number;
  bonuses: number | null;
  deductions: number | null;
  net_salary: number;
  status: string | null;
  paid_date: string | null;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollDialog({ open, onOpenChange }: PayrollDialogProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    staff_id: '',
    bonuses: 0,
    deductions: 0,
  });

  useEffect(() => {
    if (open) {
      fetchStaff();
      fetchPayroll();
    }
  }, [open, selectedMonth, selectedYear]);

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setStaff(data as Staff[]);
  };

  const fetchPayroll = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('payroll')
      .select('*, staff(name)')
      .eq('month', selectedMonth)
      .eq('year', selectedYear)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayrollRecords(data as Payroll[]);
    }
    setIsLoading(false);
  };

  const generatePayroll = async () => {
    const selectedStaff = staff.find((s) => s.id === formData.staff_id);
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    const basicSalary = selectedStaff.salary || 0;
    const netSalary = basicSalary + formData.bonuses - formData.deductions;

    const { error } = await supabase.from('payroll').insert({
      staff_id: formData.staff_id,
      month: selectedMonth,
      year: selectedYear,
      basic_salary: basicSalary,
      bonuses: formData.bonuses,
      deductions: formData.deductions,
      net_salary: netSalary,
      status: 'generated',
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Payroll already exists for this staff member this month');
      } else {
        toast.error('Failed to generate payroll');
      }
    } else {
      toast.success('Payroll generated');
      setShowForm(false);
      setFormData({ staff_id: '', bonuses: 0, deductions: 0 });
      fetchPayroll();
    }
  };

  const markAsPaid = async (payrollId: string) => {
    const { error } = await supabase
      .from('payroll')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      })
      .eq('id', payrollId);

    if (error) {
      toast.error('Failed to update payroll');
    } else {
      toast.success('Marked as paid');
      fetchPayroll();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payroll Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month/Year Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Month:</Label>
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Year:</Label>
              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? 'secondary' : 'default'}
              className={showForm ? '' : 'gradient-primary'}
            >
              {showForm ? 'Cancel' : 'Generate Payroll'}
            </Button>
          </div>

          {/* Generate Form */}
          {showForm && (
            <div className="rounded-lg border p-4 space-y-4 bg-muted/50">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Staff Member</Label>
                  <Select
                    value={formData.staff_id}
                    onValueChange={(v) => setFormData({ ...formData, staff_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} (₹{s.salary?.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bonuses (₹)</Label>
                  <Input
                    type="number"
                    value={formData.bonuses}
                    onChange={(e) =>
                      setFormData({ ...formData, bonuses: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deductions (₹)</Label>
                  <Input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) =>
                      setFormData({ ...formData, deductions: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <Button onClick={generatePayroll}>Generate</Button>
            </div>
          )}

          {/* Payroll Records */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : payrollRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No payroll records for {monthNames[selectedMonth - 1]} {selectedYear}
                    </TableCell>
                  </TableRow>
                ) : (
                  payrollRecords.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.staff?.name}</TableCell>
                      <TableCell>₹{p.basic_salary.toLocaleString()}</TableCell>
                      <TableCell>₹{(p.bonuses || 0).toLocaleString()}</TableCell>
                      <TableCell>₹{(p.deductions || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{p.net_salary.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === 'paid' ? 'default' : 'outline'}
                          className={p.status === 'paid' ? 'bg-success' : ''}
                        >
                          {p.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPaid(p.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
