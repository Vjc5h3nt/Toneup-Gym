import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Member, Membership, MemberAttendance, Payment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays, subDays, isAfter } from 'date-fns';
import {
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  LogIn,
  Clock,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  LogOut,
} from 'lucide-react';
import AddMembershipDialog from './AddMembershipDialog';
import AddPaymentDialog from './AddPaymentDialog';

interface MemberProfileSheetProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const membershipStatusColors: Record<string, string> = {
  active: 'bg-success text-success-foreground',
  expired: 'bg-destructive text-destructive-foreground',
  frozen: 'bg-info text-info-foreground',
  hold: 'bg-warning text-warning-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const membershipTypeLabels: Record<string, string> = {
  normal: 'Regular Gym',
  personal_training: 'Personal Training',
  other: 'Other',
};

export default function MemberProfileSheet({
  member,
  open,
  onOpenChange,
  onUpdate,
}: MemberProfileSheetProps) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [attendance, setAttendance] = useState<MemberAttendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addMembershipOpen, setAddMembershipOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [membershipFilter, setMembershipFilter] = useState<string>('all');

  useEffect(() => {
    if (open && member) {
      fetchMemberships(member.id);
      fetchAttendance(member.id);
      fetchPayments(member.id);
    }
  }, [open, member]);

  const fetchMemberships = async (memberId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', memberId)
      .order('start_date', { ascending: false });

    if (!error && data) {
      setMemberships(data as Membership[]);
    }
    setIsLoading(false);
  };

  const fetchAttendance = async (memberId: string) => {
    // Fetch attendance for past 2 days
    const twoDaysAgo = subDays(new Date(), 2);
    const { data, error } = await supabase
      .from('member_attendance')
      .select('*')
      .eq('member_id', memberId)
      .gte('check_in_time', twoDaysAgo.toISOString())
      .order('check_in_time', { ascending: false });

    if (!error && data) {
      setAttendance(data as MemberAttendance[]);
    }
  };

  const fetchPayments = async (memberId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, membership:memberships(type)')
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false });

    if (!error && data) {
      setPayments(data as Payment[]);
    }
  };

  const handleCheckIn = async () => {
    if (!member) return;

    const { error } = await supabase.from('member_attendance').insert({
      member_id: member.id,
      check_in_time: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to check in');
    } else {
      toast.success('Member checked in');
      fetchAttendance(member.id);
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    if (!member) return;

    const { error } = await supabase
      .from('member_attendance')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', attendanceId);

    if (error) {
      toast.error('Failed to check out');
    } else {
      toast.success('Member checked out');
      fetchAttendance(member.id);
    }
  };

  // Find today's active session (checked in but not checked out)
  const todayActiveSession = attendance.find((a) => {
    const checkInDate = parseISO(a.check_in_time);
    const today = new Date();
    return (
      checkInDate.toDateString() === today.toDateString() && !a.check_out_time
    );
  });

  const filteredMemberships = memberships.filter((m) => {
    if (membershipFilter === 'all') return true;
    return m.status === membershipFilter;
  });

  const activeMembership = memberships.find((m) => m.status === 'active');

  // Calculate duration for each attendance record
  const getAttendanceDuration = (record: MemberAttendance) => {
    if (!record.check_out_time) return 'Active';
    const checkIn = parseISO(record.check_in_time);
    const checkOut = parseISO(record.check_out_time);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!member) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0">
          {/* Header with Member Info */}
          <div className="bg-sidebar p-6 text-sidebar-foreground">
            <SheetHeader className="text-left">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-2xl font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <SheetTitle className="text-xl text-sidebar-foreground">{member.name}</SheetTitle>
                  <p className="text-sm text-sidebar-foreground/70">
                    Member ID: {member.id.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {activeMembership && (
                      <Badge className={membershipStatusColors[activeMembership.status]}>
                        {membershipTypeLabels[activeMembership.type] || activeMembership.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sidebar-foreground/70" />
                <span>{member.phone}</span>
              </div>
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sidebar-foreground/70" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sidebar-foreground/70" />
                  <span>DOB: {format(parseISO(member.date_of_birth), 'PP')}</span>
                </div>
              )}
              {member.emergency_contact_name && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-sidebar-foreground/70" />
                  <span>Emergency: {member.emergency_contact_name}</span>
                </div>
              )}
            </div>

            {/* Quick Actions - Both Check In and Check Out */}
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                onClick={handleCheckIn} 
                className="gradient-primary"
                disabled={!!todayActiveSession}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Check In
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => todayActiveSession && handleCheckOut(todayActiveSession.id)}
                disabled={!todayActiveSession}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Check Out
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setAddPaymentOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="memberships" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="memberships">Memberships</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* Memberships Tab */}
              <TabsContent value="memberships" className="m-0 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {['all', 'active', 'expired', 'frozen'].map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={membershipFilter === filter ? 'default' : 'outline'}
                        onClick={() => setMembershipFilter(filter)}
                        className="capitalize"
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => setAddMembershipOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : filteredMemberships.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No memberships found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMemberships.map((m) => {
                      const daysLeft = differenceInDays(parseISO(m.end_date), new Date());
                      return (
                        <div
                          key={m.id}
                          className="rounded-lg border p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">
                              {membershipTypeLabels[m.type] || m.type}
                            </div>
                            <Badge className={membershipStatusColors[m.status]}>
                              {m.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="block text-xs">Start</span>
                              {format(parseISO(m.start_date), 'PP')}
                            </div>
                            <div>
                              <span className="block text-xs">End</span>
                              {format(parseISO(m.end_date), 'PP')}
                            </div>
                            <div>
                              <span className="block text-xs">Price</span>
                              ₹{m.price.toLocaleString()}
                            </div>
                          </div>
                          {m.status === 'active' && (
                            <div className={`text-sm ${daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expires today'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Attendance Tab - Past 2 days */}
              <TabsContent value="attendance" className="m-0 p-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Showing attendance logs for the past 2 days</p>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Check In</TableHead>
                          <TableHead>Check Out</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No attendance records in the past 2 days
                            </TableCell>
                          </TableRow>
                        ) : (
                          attendance.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell>
                                {format(parseISO(a.check_in_time), 'PP')}
                              </TableCell>
                              <TableCell>
                                {format(parseISO(a.check_in_time), 'p')}
                              </TableCell>
                              <TableCell>
                                {a.check_out_time
                                  ? format(parseISO(a.check_out_time), 'p')
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={a.check_out_time ? 'secondary' : 'default'}>
                                  {getAttendanceDuration(a)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {!a.check_out_time && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCheckOut(a.id)}
                                  >
                                    <LogOut className="h-3 w-3 mr-1" />
                                    Out
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="m-0 p-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No payment records
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              {format(parseISO(p.payment_date), 'PP')}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {p.invoice_number || '-'}
                            </TableCell>
                            <TableCell className="font-semibold">
                              ₹{p.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="capitalize">
                              {p.payment_method?.replace('_', ' ')}
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
        </SheetContent>
      </Sheet>

      <AddMembershipDialog
        memberId={member.id}
        open={addMembershipOpen}
        onOpenChange={setAddMembershipOpen}
        onSuccess={() => {
          fetchMemberships(member.id);
          onUpdate();
        }}
      />

      <AddPaymentDialog
        memberId={member.id}
        memberships={memberships}
        open={addPaymentOpen}
        onOpenChange={setAddPaymentOpen}
        onSuccess={() => {
          fetchPayments(member.id);
          onUpdate();
        }}
      />
    </>
  );
}
