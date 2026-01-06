import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default async function SchedulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Schedule Management
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/schedules/calendar">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Calendar View
              </CardTitle>
              <Calendar className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View all schedules in calendar format. Read-only mode.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/schedules/opentalk">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                OpenTalk Management
              </CardTitle>
              <Users className="ml-auto h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage OpenTalk schedules, cycles, and swap requests.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
