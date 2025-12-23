import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Staff, StaffAttendance } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  LogIn,
  LogOut,
} from 'lucide-react';

interface StaffDetailDialogProps {
  staff: Staff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface Payroll {
  id: string;
  staff_id: string;
  month: number;
  year: number;
  basic_salary: number;
  bonuses: number | null;
  deductions: number | null;
  net_salary: number;
  status: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StaffDetailDialog({
  staff,
  open,
  onOpenChange,
  onUpdate,
}: StaffDetailDialogProps) {
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<StaffAttendance | null>(null);

  useEffect(() => {
    if (open && staff) {
      fetchAttendance(staff.id);
      fetchPayroll(staff.id);
    }
  }, [open, staff]);

  const fetchAttendance = async (staffId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('staff_attendance')
      .select('*')
      .eq('staff_id', staffId)
      .order('date', { ascending: false })
      .limit(30);

    if (!error && data) {
      setAttendance(data as StaffAttendance[]);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = data.find((a) => a.date === today);
      setTodayAttendance(todayRecord || null);
    }
    setIsLoading(false);
  };

  const fetchPayroll = async (staffId: string) => {
    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('staff_id', staffId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12);

    if (!error && data) {
      setPayroll(data as Payroll[]);
    }
  };

  const handleCheckIn = async () => {
    if (!staff) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');

    const { error } = await supabase.from('staff_attendance').insert({
      staff_id: staff.id,
      date: today,
      in_time: now,
    });

    if (error) {
      toast.error('Failed to check in');
    } else {
      toast.success('Checked in successfully');
      fetchAttendance(staff.id);
    }
  };

  const handleCheckOut = async () => {
    if (!staff || !todayAttendance) return;
    const now = format(new Date(), 'HH:mm');

    // Calculate hours worked
    const inTime = todayAttendance.in_time;
    let hoursWorked = null;
    if (inTime) {
      const [inH, inM] = inTime.split(':').map(Number);
      const [outH, outM] = now.split(':').map(Number);
      hoursWorked = (outH + outM / 60) - (inH + inM / 60);
      hoursWorked = Math.round(hoursWorked * 100) / 100;
    }

    const { error } = await supabase
      .from('staff_attendance')
      .update({
        out_time: now,
        hours_worked: hoursWorked,
      })
      .eq('id', todayAttendance.id);

    if (error) {
      toast.error('Failed to check out');
    } else {
      toast.success('Checked out successfully');
      fetchAttendance(staff.id);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{staff.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{staff.role}</Badge>
                <Badge variant={staff.is_active ? 'default' : 'secondary'}>
                  {staff.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="info" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staff.email}</span>
                </div>
                {staff.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{staff.phone}</span>
                  </div>
                )}
                {staff.joining_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined: {format(parseISO(staff.joining_date), 'PPP')}</span>
                  </div>
                )}
                {staff.salary && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Salary: ₹{staff.salary.toLocaleString()}</span>
                  </div>
                )}
              </div>
              {staff.specialization && (
                <div>
                  <Label className="text-muted-foreground">Specialization</Label>
                  <p className="text-sm">{staff.specialization}</p>
                </div>
              )}

              <Separator />

              <div>
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {staff.can_view_members && <Badge variant="outline">View Members</Badge>}
                  {staff.can_edit_members && <Badge variant="outline">Edit Members</Badge>}
                  {staff.can_manage_leads && <Badge variant="outline">Manage Leads</Badge>}
                  {staff.can_view_reports && <Badge variant="outline">View Reports</Badge>}
                  {staff.can_manage_payroll && <Badge variant="outline">Manage Payroll</Badge>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="m-0 space-y-4">
              {/* Quick Actions */}
              <div className="flex gap-2">
                {!todayAttendance ? (
                  <Button onClick={handleCheckIn} className="gradient-primary">
                    <LogIn className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                ) : !todayAttendance.out_time ? (
                  <Button onClick={handleCheckOut} variant="secondary">
                    <LogOut className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                ) : (
                  <Badge variant="outline" className="py-2 px-4">
                    <Clock className="mr-2 h-4 w-4" />
                    Completed: {todayAttendance.hours_worked}h
                  </Badge>
                )}
              </div>

              {/* Attendance History */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>In Time</TableHead>
                      <TableHead>Out Time</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : attendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No attendance records
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendance.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{format(parseISO(a.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{a.in_time || '-'}</TableCell>
                          <TableCell>{a.out_time || '-'}</TableCell>
                          <TableCell>{a.hours_worked ? `${a.hours_worked}h` : '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="payroll" className="m-0 space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Basic</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payroll.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No payroll records
                        </TableCell>
                      </TableRow>
                    ) : (
                      payroll.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {monthNames[p.month - 1]} {p.year}
                          </TableCell>
                          <TableCell>₹{p.basic_salary.toLocaleString()}</TableCell>
                          <TableCell>₹{(p.bonuses || 0).toLocaleString()}</TableCell>
                          <TableCell>₹{(p.deductions || 0).toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{p.net_salary.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={p.status === 'paid' ? 'default' : 'outline'}
                              className={p.status === 'paid' ? 'bg-green-500 text-white' : ''}
                            >
                              {p.status || 'pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
