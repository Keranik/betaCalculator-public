import React from 'react';
import useFlowStore from '../stores/flowStore';

const Dashboard = () => {
  const { 
    calculationResults, 
    nodes, 
    edges, 
    units, 
    setUnits, 
    precision, 
    setPrecision,
    calculateRates,
    clearAll,
    exportLayout,
    importLayout
  } = useFlowStore();

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importLayout(e.target.result);
        } catch (error) {
          alert('Error importing layout: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const layoutData = exportLayout();
    const blob = new Blob([layoutData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'factory-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalMachines = nodes.length;
  const totalConnections = edges.length;
  const powerConsumption = calculationResults?.totalPower || 0;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-300 p-4 min-w-[300px] z-10">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Factory Dashboard</h3>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-600">Machines</div>
          <div className="text-xl font-bold text-blue-900">{totalMachines}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm text-green-600">Connections</div>
          <div className="text-xl font-bold text-green-900">{totalConnections}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg col-span-2">
          <div className="text-sm text-purple-600">Net Power</div>
          <div className="text-xl font-bold text-purple-900">
            {powerConsumption > 0 ? '-' : '+'}{Math.abs(powerConsumption).toFixed(1)} kW
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Settings</h4>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600">Units</label>
            <select 
              value={units} 
              onChange={(e) => setUnits(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="per_second">Per Second</option>
              <option value="per_minute">Per Minute</option>
              <option value="per_hour">Per Hour</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-600">Precision</label>
            <input 
              type="number" 
              min="0" 
              max="4" 
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={calculateRates}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Calculate Rates
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
          >
            Export
          </button>
          <label className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors cursor-pointer text-center">
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
        
        <button
          onClick={clearAll}
          className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Calculation Results */}
      {calculationResults && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Results</h4>
          <div className="text-xs text-gray-600">
            <div>Total Power: {calculationResults.totalPower?.toFixed(1)} kW</div>
            <div>Machine Count: {calculationResults.machineCount}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;