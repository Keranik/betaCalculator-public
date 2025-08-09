import { create } from 'zustand';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  getIncomers,
  getOutgoers,
  getConnectedEdges
} from 'reactflow';
import CalculationEngine from '../utils/calculationEngine';

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
  validationIssues: [],
  
  // Calculation engine
  calculationEngine: new CalculationEngine(),
  
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
  
  // Enhanced calculation functions
  calculateRates: () => {
    const { nodes, edges, calculationEngine, units } = get();
    set({ isCalculating: true });
    
    try {
      // Update the calculation engine with current graph
      calculationEngine.updateGraph(nodes, edges);
      
      // Validate the production chain
      const validationIssues = calculationEngine.validateChain();
      
      // Perform basic rate calculations
      const basicResults = calculationEngine.calculateBasicRates(units);
      
      // Enhance results with validation info
      const results = {
        ...basicResults,
        validationIssues,
        hasIssues: validationIssues.length > 0
      };
      
      set({ 
        calculationResults: results,
        validationIssues
      });
    } catch (error) {
      console.error('Calculation error:', error);
      set({ 
        calculationResults: null,
        validationIssues: [{
          type: 'calculation_error',
          message: error.message
        }]
      });
    } finally {
      set({ isCalculating: false });
    }
  },
  
  // Advanced optimization
  optimizeProduction: (objective, constraints = {}) => {
    const { nodes, edges, calculationEngine } = get();
    set({ isCalculating: true });
    
    try {
      calculationEngine.updateGraph(nodes, edges);
      const optimizationResult = calculationEngine.optimizeProduction(objective, constraints);
      
      if (optimizationResult && optimizationResult.feasible) {
        // Apply optimization results to nodes
        const updatedNodes = get().nodes.map(node => {
          const allocation = optimizationResult.machineAllocations[node.id];
          if (allocation !== undefined) {
            return {
              ...node,
              data: {
                ...node.data,
                machineCount: Math.max(1, Math.round(allocation))
              }
            };
          }
          return node;
        });
        
        set({ 
          nodes: updatedNodes,
          calculationResults: {
            ...optimizationResult,
            optimized: true
          }
        });
      } else {
        throw new Error('Optimization failed: No feasible solution found');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      set({
        validationIssues: [{
          type: 'optimization_error',
          message: error.message
        }]
      });
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
      calculationResults: null,
      validationIssues: []
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
      set({ 
        nodes, 
        edges,
        calculationResults: null,
        validationIssues: []
      });
    } catch (error) {
      console.error('Import error:', error);
      set({
        validationIssues: [{
          type: 'import_error',
          message: error.message
        }]
      });
    }
  }
}));

export default useFlowStore;