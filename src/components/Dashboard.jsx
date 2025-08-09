import React, { useState } from 'react';
import useFlowStore from '../stores/flowStore';

const Dashboard = () => {
  const { 
    calculationResults, 
    validationIssues,
    isCalculating,
    nodes, 
    edges, 
    units, 
    setUnits, 
    precision, 
    setPrecision,
    calculateRates,
    optimizeProduction,
    clearAll,
    exportLayout,
    importLayout
  } = useFlowStore();

  const [optimizationTarget, setOptimizationTarget] = useState('');
  const [showOptimization, setShowOptimization] = useState(false);

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

  const handleOptimize = () => {
    if (!optimizationTarget) return;
    
    const objective = {
      type: 'max',
      item: optimizationTarget
    };
    
    const constraints = {
      integerMachines: true,
      maxMachines: {}
    };
    
    // Add reasonable upper bounds for machines
    nodes.forEach(node => {
      constraints.maxMachines[node.id] = 100; // Max 100 of each machine
    });
    
    optimizeProduction(objective, constraints);
  };

  const totalMachines = nodes.length;
  const totalConnections = edges.length;
  const powerConsumption = calculationResults?.totalPower || 0;

  // Get unique output items for optimization
  const outputItems = new Set();
  nodes.forEach(node => {
    (node.data.outputs || []).forEach(output => {
      outputItems.add(output.name);
    });
  });

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-300 p-4 min-w-[320px] max-w-[400px] z-10 max-h-[90vh] overflow-y-auto">
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

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Issues Detected</h4>
          <div className="space-y-1">
            {validationIssues.slice(0, 3).map((issue, index) => (
              <div key={index} className="text-xs text-yellow-700">
                • {issue.message}
              </div>
            ))}
            {validationIssues.length > 3 && (
              <div className="text-xs text-yellow-600">
                ...and {validationIssues.length - 3} more issues
              </div>
            )}
          </div>
        </div>
      )}

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
      <div className="space-y-2 mb-4">
        <button
          onClick={calculateRates}
          disabled={isCalculating}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Rates'}
        </button>
        
        <button
          onClick={() => setShowOptimization(!showOptimization)}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
        >
          {showOptimization ? 'Hide Optimization' : 'Show Optimization'}
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
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

      {/* Optimization Panel */}
      {showOptimization && outputItems.size > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-2">Optimization</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-green-700">Maximize Production Of:</label>
              <select 
                value={optimizationTarget} 
                onChange={(e) => setOptimizationTarget(e.target.value)}
                className="w-full text-sm border border-green-300 rounded px-2 py-1"
              >
                <option value="">Select item...</option>
                {Array.from(outputItems).map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleOptimize}
              disabled={!optimizationTarget || isCalculating}
              className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-green-300 transition-colors"
            >
              Optimize Layout
            </button>
          </div>
        </div>
      )}

      {/* Calculation Results */}
      {calculationResults && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Results {calculationResults.optimized && '(Optimized)'}
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Total Power: {calculationResults.totalPower?.toFixed(1)} kW</div>
            <div>Machine Count: {calculationResults.machineCount}</div>
            
            {calculationResults.bottlenecks && calculationResults.bottlenecks.length > 0 && (
              <div className="mt-2">
                <div className="font-medium text-red-600">Bottlenecks:</div>
                {calculationResults.bottlenecks.slice(0, 3).map((bottleneck, index) => (
                  <div key={index} className="text-red-500">
                    • {bottleneck.item}: {bottleneck.deficit.toFixed(1)} deficit
                  </div>
                ))}
              </div>
            )}
            
            {calculationResults.items && Object.keys(calculationResults.items).length > 0 && (
              <div className="mt-2">
                <div className="font-medium">Item Flows:</div>
                <div className="max-h-24 overflow-y-auto">
                  {Object.entries(calculationResults.items).slice(0, 5).map(([item, flow]) => (
                    <div key={item} className="flex justify-between">
                      <span className="truncate">{item}:</span>
                      <span className={flow.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {flow.balance >= 0 ? '+' : ''}{flow.balance.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;