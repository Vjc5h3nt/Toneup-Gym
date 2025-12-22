import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Staff } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, User } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff</h1>
          <p className="text-muted-foreground">Manage trainers and staff members</p>
        </div>
        <Button className="gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
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
            <Card key={s.id} className="transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">{s.role}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.email}</p>
                {s.specialization && (
                  <p className="text-xs text-muted-foreground mt-1">{s.specialization}</p>
                )}
                <Badge variant={s.is_active ? 'default' : 'secondary'} className="mt-2">
                  {s.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
