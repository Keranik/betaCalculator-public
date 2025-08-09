import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

import useFlowStore from '../stores/flowStore';
import MachineNode from './MachineNode';
import { gameData } from '../data/gameData';

const nodeTypes = {
  machineNode: MachineNode,
};

const FlowCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    sidebarOpen
  } = useFlowStore();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = event.target.getBoundingClientRect();
      const machineData = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      // Calculate position relative to the React Flow instance
      const position = {
        x: event.clientX - reactFlowBounds.left - (sidebarOpen ? 320 : 0),
        y: event.clientY - reactFlowBounds.top,
      };

      // Find recipes for this machine
      const recipes = gameData.recipes?.filter(r => r.machineId === machineData.id) || [];
      
      if (recipes.length > 0) {
        const recipe = recipes[0]; // Use first recipe by default
        
        addNode({
          position,
          machineId: machineData.id,
          machineName: machineData.name,
          name: recipe.name,
          inputs: recipe.inputs,
          outputs: recipe.outputs,
          electricityConsumed: machineData.electricityConsumed,
          electricityGenerated: machineData.electricityGenerated,
          duration: recipe.duration,
          recipes: recipes
        });
      }
    },
    [addNode, sidebarOpen]
  );

  return (
    <div 
      className={`h-full transition-all duration-300 ${
        sidebarOpen ? 'ml-80' : 'ml-0'
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        className="bg-gray-50"
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;