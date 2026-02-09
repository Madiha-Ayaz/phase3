import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchTasks } from '../lib/api';

export default function StatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user) {
          const tasks = await fetchTasks();
          const total = tasks.length;
          const completed = tasks.filter((task: any) => task.completed).length;
          const pending = total - completed;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

          setStats({
            total,
            completed,
            pending,
            completionRate
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [user]);

  const statsData = [
    { title: 'Total Tasks', value: stats.total, icon: '📊', color: 'from-purple-500 to-purple-600' },
    { title: 'Completed', value: stats.completed, icon: '✅', color: 'from-green-500 to-green-600' },
    { title: 'Pending', value: stats.pending, icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
    { title: 'Completion Rate', value: `${stats.completionRate}%`, icon: '📈', color: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            </div>
            <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}