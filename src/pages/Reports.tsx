import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">View detailed analytics and reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Revenue Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">View daily, weekly, and monthly revenue breakdowns</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Lead Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Track lead conversion rates by source and staff</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-success" />
              Member Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Member demographics and membership trends</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              Staff Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Staff attendance and performance reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
