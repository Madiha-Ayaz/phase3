import { useState } from 'react';
import { Task } from '@/types/task';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [tags, setTags] = useState(task.tags.join(', '));

  const handleSaveEdit = () => {
    const updatedTask: Task = {
      ...task,
      title,
      description,
      priority,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };
    onEdit(updatedTask);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setTags(task.tags.join(', '));
    setIsEditing(false);
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Task title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Description"
            rows={3}
          />
          <div className="flex gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-1/2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tags (comma separated)"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleComplete(task.id)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                title="Edit task"
              >
                <FaEdit size={14} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
                title="Delete task"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>

          <h3
            className={`text-lg font-semibold mb-2 ${
              task.completed ? 'text-gray-400 line-through' : 'text-white'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className={`text-gray-300 mb-3 ${task.completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-1 ${getPriorityColor()} text-white text-xs rounded-full`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
};