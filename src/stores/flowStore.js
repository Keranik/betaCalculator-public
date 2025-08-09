import { create } from 'zustand';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  getIncomers,
  getOutgoers,
  getConnectedEdges
} from 'reactflow';

const useFlowStore = create((set, get) => ({
  // React Flow state
  nodes: [],
  edges: [],
  
  // UI state
  selectedNode: null,
  sidebarOpen: true,
  darkMode: false,
  
  // Settings
  units: 'per_minute', // per_second, per_minute, per_hour
  precision: 2,
  
  // Calculation state
  isCalculating: false,
  calculationResults: null,
  
  // Actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  
  addNode: (nodeData) => {
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'machineNode',
      position: nodeData.position || { x: 0, y: 0 },
      data: {
        ...nodeData,
        inputs: nodeData.inputs || [],
        outputs: nodeData.outputs || [],
        machineCount: 1,
        efficiency: 1.0
      }
    };
    
    set({ nodes: [...get().nodes, newNode] });
    return newNode.id;
  },
  
  removeNode: (nodeId) => {
    const { nodes, edges } = get();
    const remainingNodes = nodes.filter(n => n.id !== nodeId);
    const remainingEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    
    set({ 
      nodes: remainingNodes, 
      edges: remainingEdges 
    });
  },
  
  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      ),
    });
  },
  
  selectNode: (nodeId) => set({ selectedNode: nodeId }),
  
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  
  toggleDarkMode: () => set({ darkMode: !get().darkMode }),
  
  setUnits: (units) => set({ units }),
  
  setPrecision: (precision) => set({ precision }),
  
  // Calculation functions
  calculateRates: () => {
    const { nodes, edges } = get();
    set({ isCalculating: true });
    
    try {
      // Basic calculation - traverse graph and compute rates
      const results = performBasicCalculation(nodes, edges);
      set({ calculationResults: results });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      set({ isCalculating: false });
    }
  },
  
  // Clear all data
  clearAll: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      calculationResults: null
    });
  },
  
  // Save/Load functions
  exportLayout: () => {
    const { nodes, edges } = get();
    return JSON.stringify({ nodes, edges }, null, 2);
  },
  
  importLayout: (layoutJson) => {
    try {
      const { nodes, edges } = JSON.parse(layoutJson);
      set({ nodes, edges });
    } catch (error) {
      console.error('Import error:', error);
    }
  }
}));

// Basic calculation function (placeholder for now)
function performBasicCalculation(nodes, edges) {
  // This will be expanded to handle the actual production calculations
  const results = {
    totalPower: 0,
    machineCount: nodes.length,
    items: {}
  };
  
  nodes.forEach(node => {
    if (node.data.electricityConsumed) {
      results.totalPower += node.data.electricityConsumed * (node.data.machineCount || 1);
    }
    if (node.data.electricityGenerated) {
      results.totalPower -= node.data.electricityGenerated * (node.data.machineCount || 1);
    }
  });
  
  return results;
}

export default useFlowStore;