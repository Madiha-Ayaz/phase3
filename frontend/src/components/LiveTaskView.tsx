import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchTasks, updateTask, deleteTask } from '../lib/api';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

interface LiveTaskViewProps {
  filter: string;
  searchQuery: string;
  refreshTrigger?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  due_date?: string;
  priority: string;
  tags: string[];
  created_at: string;
}

export default function LiveTaskView({ filter, searchQuery, refreshTrigger }: LiveTaskViewProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<Partial<Task>>({});

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        if (user) {
          const tasksData = await fetchTasks();
          setTasks(tasksData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user, refreshTrigger]);

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      tags: task.tags,
    });
  };

  const handleSaveEdit = async (taskId: string) => {
    try {
      if (!editingTaskData.title?.trim()) {
        setError('Title is required');
        return;
      }

      await updateTask(taskId, editingTaskData);
      setTasks(tasks.map((task) =>
        task.id === taskId ? { ...task, ...editingTaskData } as Task : task
      ));
      setEditingTaskId(null);
      setEditingTaskData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskData({});
  };

  const filteredTasks = tasks.filter((task) => {
    const searchTerm = searchQuery.trim().toLowerCase();

    const matchesSearch = !searchTerm ||
      (task.title && task.title.toLowerCase().includes(searchTerm)) ||
      (task.description && task.description.toLowerCase().includes(searchTerm)) ||
      (task.tags && Array.isArray(task.tags) && task.tags.some((tag) => tag && tag.toLowerCase().includes(searchTerm))) ||
      (task.priority && task.priority.toLowerCase().includes(searchTerm));

    let matchesStatus = true;
    if (filter === 'Active' || filter === 'Pending') matchesStatus = !task.completed;
    else if (filter === 'Completed') matchesStatus = task.completed;

    return matchesSearch && matchesStatus;
  });

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed: !completed });
      setTasks(tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !completed } : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-white text-xl">Loading tasks...</div>;

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No tasks found</div>
          <p className="text-gray-500 mt-2">
            {searchQuery
              ? 'Try adjusting your search terms'
              : filter === 'Completed'
              ? 'No completed tasks yet'
              : filter === 'Active' || filter === 'Pending'
              ? 'No pending tasks'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            editingTaskId === task.id ? (
              // ── Edit mode ────────────────────────────────────────────────
              <div
                key={task.id}
                className="p-4 rounded-xl border bg-white/10 border-purple-500/50 transition-all overflow-hidden"
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingTaskData.title || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Task title"
                  />
                  <textarea
                    value={editingTaskData.description || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={editingTaskData.priority || 'low'}
                      onChange={(e) => setEditingTaskData({ ...editingTaskData, priority: e.target.value })}
                      className="px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[110px]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      type="text"
                      value={editingTaskData.tags?.join(', ') || ''}
                      onChange={(e) =>
                        setEditingTaskData({
                          ...editingTaskData,
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                      className="flex-1 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Tags (comma separated)"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-2 px-5 rounded-lg transition-colors"
                    >
                      <FaCheck /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white py-2 px-5 rounded-lg transition-colors"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // ── View mode ────────────────────────────────────────────────
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all overflow-hidden ${
                  task.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4 w-full">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.completed)}
                      className={`mt-1.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-400 hover:border-purple-500'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-medium text-base ${
                          task.completed ? 'text-gray-400 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p
                          className={`text-sm mt-1.5 ${
                            task.completed ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Tags + badges ── fixed overflow */}
                      <div className="mt-3 flex flex-wrap gap-2 items-center max-w-full overflow-hidden">
                        {task.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/40 whitespace-nowrap flex-shrink-0 max-w-[180px] overflow-hidden text-ellipsis"
                          >
                            {tag}
                          </span>
                        ))}

                        {task.due_date && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/40 whitespace-nowrap flex-shrink-0">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-1 text-xs rounded-full border whitespace-nowrap flex-shrink-0 ${
                            task.priority === 'high'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : task.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                              : 'bg-green-500/20 text-green-300 border-green-500/40'
                          }`}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="text-blue-400 hover:text-blue-300 p-1.5"
                      title="Edit"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 p-1.5"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}