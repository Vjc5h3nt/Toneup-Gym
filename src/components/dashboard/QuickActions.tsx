import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Users, FileText, Calendar } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Member', icon: UserPlus, path: '/members', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400' },
    { label: 'View Leads', icon: Users, path: '/leads', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400' },
    { label: 'View Reports', icon: FileText, path: '/reports', color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-400' },
    { label: 'Lead Calendar', icon: Calendar, path: '/lead-calendar', color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className={action.color}
            onClick={() => navigate(action.path)}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
