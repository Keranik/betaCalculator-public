import React from 'react';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import useFlowStore from './stores/flowStore';

function App() {
  const { darkMode } = useFlowStore();

  return (
    <div className={`w-full h-screen ${darkMode ? 'dark' : ''}`}>
      <ReactFlowProvider>
        <div className="relative w-full h-full bg-gray-100">
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 h-16 bg-white shadow-md border-b border-gray-300 z-20 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Captain of Industry Factory Calculator
              </h1>
              <div className="text-sm text-gray-600">
                Build and optimize your production chains
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => useFlowStore.getState().toggleDarkMode()}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </header>

          {/* Main Content */}
          <div className="pt-16 h-full">
            <Sidebar />
            <FlowCanvas />
            <Dashboard />
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  );
}

export default App;
