import { MessageCircle, Zap, Users, ArrowRight, LineChart, Mail, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  // Mock data - replace with real data from your API
  const stats = [
    { title: "Total Messages", value: "142", change: "+12%", icon: <MessageCircle className="w-6 h-6 text-red-500" /> },
    { title: "Reply Rate", value: "68%", change: "+8%", icon: <Mail className="w-6 h-6 text-purple-500" /> },
    { title: "New Contacts", value: "23", change: "+5", icon: <Users className="w-6 h-6 text-blue-500" /> },
    { title: "Avg. Response Time", value: "2.4h", change: "-0.8h", icon: <Zap className="w-6 h-6 text-green-500" /> },
  ];

  const recentMessages = [
    { name: "Sarah Johnson", platform: "LinkedIn", status: "Replied", time: "2h ago" },
    { name: "Mike Rodriguez", platform: "Email", status: "Opened", time: "5h ago" },
    { name: "Alex Chen", platform: "Twitter", status: "Pending", time: "1d ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your outreach performance</p>
        </div>
        <Button className="bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700">
          New Message <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span> vs last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-700" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{message.name}</p>
                    <p className="text-sm text-gray-500">{message.platform}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      message.status === 'Replied' ? 'bg-green-100 text-green-800' :
                      message.status === 'Opened' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Users className="w-4 h-4" />
              Import Contacts
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <LineChart className="w-4 h-4" />
              View Analytics
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <MessageCircle className="w-4 h-4" />
              Message Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-gray-700" />
            Reply Rate Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Performance chart will appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;