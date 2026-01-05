import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to QN Office Management System
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cleaning Schedules</CardTitle>
            <CardDescription>Manage office cleaning schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              View and update cleaning schedules for different office areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Talks</CardTitle>
            <CardDescription>Office discussion topics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Browse and participate in office discussions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penalties</CardTitle>
            <CardDescription>Office rule violations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              View penalty records and office rules
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
