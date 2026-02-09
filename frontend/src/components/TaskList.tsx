'use client';

import { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '@/types/task';

interface TaskListProps {
  onTaskAdded?: () => void;
  refreshTrigger?: number;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onTaskAdded, refreshTrigger, onTaskUpdated, onTaskDeleted }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-15rem)]">
      {tasks.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No tasks yet. Add your first task!
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={async (id: string) => {
                // Toggle task completion status
                try {
                  const token = localStorage.getItem('token');
                  if (!token) return;

                  const taskToToggle = tasks.find(t => t.id === id);
                  if (!taskToToggle) return;

                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      ...taskToToggle,
                      completed: !taskToToggle.completed
                    }),
                  });

                  if (response.ok) {
                    fetchTasks(); // Refresh the list
                    if (onTaskUpdated) onTaskUpdated();
                  }
                } catch (error) {
                  console.error('Error toggling task completion:', error);
                }
              }}
              onEdit={async (updatedTask: Task) => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) return;

                  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${updatedTask.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(updatedTask),
                  });

                  if (response.ok) {
                    fetchTasks(); // Refresh the list
                    if (onTaskUpdated) onTaskUpdated();
                  }
                } catch (error) {
                  console.error('Error updating task:', error);
                }
              }}
              onDelete={async (id: string) => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });

                    if (response.ok) {
                      fetchTasks(); // Refresh the list
                      if (onTaskDeleted) onTaskDeleted();
                    }
                  } catch (error) {
                    console.error('Error deleting task:', error);
                  }
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};