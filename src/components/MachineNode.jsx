import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const MachineNode = memo(({ data, selected }) => {
  const { 
    name, 
    machineName, 
    inputs = [], 
    outputs = [], 
    machineCount = 1,
    efficiency = 1.0,
    electricityConsumed = 0,
    electricityGenerated = 0
  } = data;

  return (
    <div className={`
      px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[200px]
      ${selected ? 'border-blue-500' : 'border-gray-300'}
    `}>
      {/* Machine Header */}
      <div className="font-bold text-sm text-gray-900 mb-2">
        {machineName || name}
      </div>
      
      {/* Machine Count */}
      <div className="text-xs text-gray-600 mb-2">
        Count: {machineCount} | Efficiency: {(efficiency * 100).toFixed(0)}%
      </div>
      
      {/* Power Info */}
      {(electricityConsumed > 0 || electricityGenerated > 0) && (
        <div className="text-xs text-blue-600 mb-2">
          {electricityConsumed > 0 && `⚡ -${electricityConsumed * machineCount}kW`}
          {electricityGenerated > 0 && `⚡ +${electricityGenerated * machineCount}kW`}
        </div>
      )}
      
      {/* Input Handles */}
      <div className="mb-2">
        {inputs.map((input, index) => (
          <div key={index} className="text-xs text-red-600 flex items-center relative">
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`}
              style={{ 
                left: -6,
                top: `${20 + (index * 20)}px`,
                background: '#ef4444',
                width: 12,
                height: 12
              }}
            />
            <span className="ml-2">
              ← {input.name}: {(input.quantity * machineCount / 10).toFixed(1)}/min
            </span>
          </div>
        ))}
      </div>
      
      {/* Output Handles */}
      <div>
        {outputs.map((output, index) => (
          <div key={index} className="text-xs text-green-600 flex items-center justify-end relative">
            <span className="mr-2">
              {output.name}: {(output.quantity * machineCount / 10).toFixed(1)}/min →
            </span>
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${index}`}
              style={{ 
                right: -6,
                top: `${20 + (index * 20)}px`,
                background: '#22c55e',
                width: 12,
                height: 12
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

MachineNode.displayName = 'MachineNode';

export default MachineNode;