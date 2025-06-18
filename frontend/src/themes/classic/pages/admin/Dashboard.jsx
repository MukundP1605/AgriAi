import React from 'react';
import { AiOutlineUser, AiOutlineCloudServer, AiOutlineAlert, AiOutlineFileText } from 'react-icons/ai';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts
const userData = [
  { month: 'Jan', users: 45 },
  { month: 'Feb', users: 52 },
  { month: 'Mar', users: 68 },
  { month: 'Apr', users: 82 },
  { month: 'May', users: 95 },
  { month: 'Jun', users: 110 },
];

const pieData = [
  { name: 'Farmers', value: 68 },
  { name: 'Researchers', value: 22 },
  { name: 'Support', value: 5 },
  { name: 'Admin', value: 5 },
];

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

const Dashboard = () => {
  // Sample metrics for dashboard cards
  const metrics = [
    { title: 'Total Users', value: '1,250', icon: <AiOutlineUser size={28} />, color: 'bg-blue-500' },
    { title: 'AI Recommendations', value: '3,482', icon: <AiOutlineCloudServer size={28} />, color: 'bg-green-500' },
    { title: 'Weather Alerts', value: '142', icon: <AiOutlineAlert size={28} />, color: 'bg-yellow-500' },
    { title: 'Content Items', value: '358', icon: <AiOutlineFileText size={28} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4"
          >
            <div className={`${metric.color} text-white p-3 rounded-full`}>
              {metric.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { user: 'Rahul Singh', action: 'Created', resource: 'Crop recommendation', time: '2 minutes ago' },
                { user: 'Priya Patel', action: 'Updated', resource: 'Profile information', time: '45 minutes ago' },
                { user: 'Amit Kumar', action: 'Requested', resource: 'Weather forecast', time: '1 hour ago' },
                { user: 'Deepa Sharma', action: 'Uploaded', resource: 'Disease image', time: '3 hours ago' },
                { user: 'Vijay Reddy', action: 'Commented', resource: 'Community post', time: '5 hours ago' },
              ].map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.user}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.resource}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
