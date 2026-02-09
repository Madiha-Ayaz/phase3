'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { AdvancedChatInterface } from '@/components/AdvancedChatInterface';

export default function AIAssistantPage() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Dashboard Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
              <p className="text-gray-300 mt-2">Chat with your personal AI assistant to manage tasks</p>
            </div>

            {/* AI Assistant Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Instructions Panel */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">How to use AI Assistant</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Add tasks: "Create a new task to buy groceries"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>List tasks: "Show me my tasks"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Complete tasks: "Mark task #1 as completed" or "Complete the grocery task"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Delete tasks: "Delete my urgent tasks" or "Remove task #2"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Manage priorities: "Set high priority for project"</span>
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <h3 className="text-purple-300 font-medium mb-2">Pro Tips</h3>
                  <ul className="text-sm text-purple-200 space-y-1">
                    <li>• Use natural language to communicate with the AI</li>
                    <li>• The AI remembers context during your conversation</li>
                    <li>• Your tasks are securely stored and private</li>
                  </ul>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Chat with AI</h2>
                <div className="h-[500px]">
                  <AdvancedChatInterface
                    onTaskAction={() => setRefreshCounter(prev => prev + 1)}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}