import React from 'react';
import { gameData, getCategories, getMachinesByCategory } from '../data/gameData';
import useFlowStore from '../stores/flowStore';

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, addNode } = useFlowStore();
  const categories = getCategories();

  const handleDragStart = (event, machineData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(machineData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleMachineClick = (machine) => {
    // Add machine to center of canvas
    const recipes = gameData.recipes.filter(r => r.machineId === machine.id);
    
    if (recipes.length > 0) {
      // Use the first recipe by default
      const recipe = recipes[0];
      
      addNode({
        position: { x: 250, y: 250 },
        machineId: machine.id,
        machineName: machine.name,
        name: recipe.name,
        inputs: recipe.inputs,
        outputs: recipe.outputs,
        electricityConsumed: machine.electricityConsumed,
        electricityGenerated: machine.electricityGenerated,
        duration: recipe.duration,
        recipes: recipes // Store all available recipes
      });
    }
  };

  if (!sidebarOpen) {
    return (
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={toggleSidebar}
          className="bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600"
        >
          ☰
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-lg border-r border-gray-300 z-10 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Machines & Buildings</h2>
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search machines..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="p-4">
        {categories.map(category => {
          const machines = getMachinesByCategory(category);
          
          return (
            <div key={category} className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-1">
                {machines.map(machine => (
                  <div
                    key={machine.id}
                    className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, machine)}
                    onClick={() => handleMachineClick(machine)}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {machine.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Workers: {machine.workers}
                      {machine.electricityConsumed > 0 && ` | ⚡ ${machine.electricityConsumed}kW`}
                      {machine.electricityGenerated > 0 && ` | ⚡ +${machine.electricityGenerated}kW`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;