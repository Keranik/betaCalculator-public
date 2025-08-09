import { create, all } from 'mathjs';
// Import linear programming solver
// Note: javascript-lp-solver might need to be imported differently in some environments
import Solver from 'javascript-lp-solver';

const math = create(all);

/**
 * Advanced calculation engine for factory optimization
 * Uses linear programming to solve production optimization problems
 */

export class CalculationEngine {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.items = new Map();
    this.recipes = new Map();
  }

  /**
   * Update the graph data for calculation
   */
  updateGraph(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.buildItemsMap();
    this.buildRecipesMap();
  }

  /**
   * Build a map of all items in the production chain
   */
  buildItemsMap() {
    this.items.clear();
    
    this.nodes.forEach(node => {
      const { inputs = [], outputs = [] } = node.data;
      
      inputs.forEach(input => {
        if (!this.items.has(input.name)) {
          this.items.set(input.name, {
            name: input.name,
            producers: [],
            consumers: [],
            netFlow: 0
          });
        }
        this.items.get(input.name).consumers.push({
          nodeId: node.id,
          quantity: input.quantity
        });
      });

      outputs.forEach(output => {
        if (!this.items.has(output.name)) {
          this.items.set(output.name, {
            name: output.name,
            producers: [],
            consumers: [],
            netFlow: 0
          });
        }
        this.items.get(output.name).producers.push({
          nodeId: node.id,
          quantity: output.quantity
        });
      });
    });
  }

  /**
   * Build a map of recipes for optimization
   */
  buildRecipesMap() {
    this.recipes.clear();
    
    this.nodes.forEach(node => {
      this.recipes.set(node.id, {
        inputs: node.data.inputs || [],
        outputs: node.data.outputs || [],
        duration: node.data.duration || 1,
        machineCount: node.data.machineCount || 1,
        efficiency: node.data.efficiency || 1.0,
        electricityConsumed: node.data.electricityConsumed || 0,
        electricityGenerated: node.data.electricityGenerated || 0
      });
    });
  }

  /**
   * Perform basic rate calculations using graph traversal
   */
  calculateBasicRates(units = 'per_minute') {
    const results = {
      totalPower: 0,
      machineCount: this.nodes.length,
      items: {},
      flows: [],
      bottlenecks: [],
      efficiency: 1.0
    };

    // Calculate power consumption/generation
    this.nodes.forEach(node => {
      const recipe = this.recipes.get(node.id);
      if (recipe) {
        const machineCount = recipe.machineCount;
        const efficiency = recipe.efficiency;
        
        if (recipe.electricityConsumed > 0) {
          results.totalPower += recipe.electricityConsumed * machineCount * efficiency;
        }
        if (recipe.electricityGenerated > 0) {
          results.totalPower -= recipe.electricityGenerated * machineCount * efficiency;
        }
      }
    });

    // Calculate item flows
    this.items.forEach((item, itemName) => {
      let totalProduced = 0;
      let totalConsumed = 0;

      item.producers.forEach(producer => {
        const recipe = this.recipes.get(producer.nodeId);
        if (recipe) {
          const rate = this.convertToUnits(
            (producer.quantity * recipe.machineCount * recipe.efficiency) / recipe.duration,
            units
          );
          totalProduced += rate;
        }
      });

      item.consumers.forEach(consumer => {
        const recipe = this.recipes.get(consumer.nodeId);
        if (recipe) {
          const rate = this.convertToUnits(
            (consumer.quantity * recipe.machineCount * recipe.efficiency) / recipe.duration,
            units
          );
          totalConsumed += rate;
        }
      });

      results.items[itemName] = {
        produced: totalProduced,
        consumed: totalConsumed,
        balance: totalProduced - totalConsumed
      };

      // Identify bottlenecks
      if (totalConsumed > totalProduced && totalConsumed > 0) {
        results.bottlenecks.push({
          item: itemName,
          deficit: totalConsumed - totalProduced,
          percentage: ((totalConsumed - totalProduced) / totalConsumed) * 100
        });
      }
    });

    return results;
  }

  /**
   * Advanced optimization using linear programming
   */
  optimizeProduction(objective, constraints = {}) {
    try {
      // Build the linear programming model
      const model = this.buildLPModel(objective, constraints);
      
      // Solve the optimization problem
      const solution = Solver.Solve(model);
      
      if (solution.feasible) {
        return this.interpretSolution(solution, objective);
      } else {
        throw new Error('No feasible solution found');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      return null;
    }
  }

  /**
   * Build linear programming model from the production graph
   */
  buildLPModel(objective, constraints) {
    const model = {
      optimize: objective.type, // 'max' or 'min'
      opType: objective.type,
      constraints: {},
      variables: {},
      ints: {}
    };

    // Define variables for each machine (production rates)
    this.nodes.forEach(node => {
      const varName = `machine_${node.id}`;
      model.variables[varName] = {};
      
      // Integer constraint for machine counts
      if (constraints.integerMachines) {
        model.ints[varName] = 1;
      }
      
      // Machine count bounds
      if (constraints.maxMachines && constraints.maxMachines[node.id]) {
        model.variables[varName].max = constraints.maxMachines[node.id];
      }
      if (constraints.minMachines && constraints.minMachines[node.id]) {
        model.variables[varName].min = constraints.minMachines[node.id];
      }
    });

    // Add objective function
    if (objective.type === 'max' && objective.item) {
      // Maximize production of specific item
      this.nodes.forEach(node => {
        const recipe = this.recipes.get(node.id);
        if (recipe) {
          const output = recipe.outputs.find(o => o.name === objective.item);
          if (output) {
            const varName = `machine_${node.id}`;
            model.variables[varName][objective.item] = output.quantity / recipe.duration;
          }
        }
      });
    } else if (objective.type === 'min' && objective.target === 'power') {
      // Minimize power consumption
      this.nodes.forEach(node => {
        const recipe = this.recipes.get(node.id);
        if (recipe && recipe.electricityConsumed > 0) {
          const varName = `machine_${node.id}`;
          model.variables[varName].power = recipe.electricityConsumed;
        }
      });
    }

    // Add balance constraints for each item
    this.items.forEach((item, itemName) => {
      const constraintName = `balance_${itemName}`;
      model.constraints[constraintName] = {};
      
      // Add production terms
      item.producers.forEach(producer => {
        const recipe = this.recipes.get(producer.nodeId);
        if (recipe) {
          const varName = `machine_${producer.nodeId}`;
          const coefficient = producer.quantity / recipe.duration;
          model.constraints[constraintName][varName] = coefficient;
        }
      });

      // Add consumption terms (negative)
      item.consumers.forEach(consumer => {
        const recipe = this.recipes.get(consumer.nodeId);
        if (recipe) {
          const varName = `machine_${consumer.nodeId}`;
          const coefficient = -consumer.quantity / recipe.duration;
          model.constraints[constraintName][varName] = 
            (model.constraints[constraintName][varName] || 0) + coefficient;
        }
      });

      // Set constraint bounds
      if (constraints.itemTargets && constraints.itemTargets[itemName]) {
        const target = constraints.itemTargets[itemName];
        if (target.min !== undefined) {
          model.constraints[constraintName].min = target.min;
        }
        if (target.max !== undefined) {
          model.constraints[constraintName].max = target.max;
        }
      } else {
        // Default: balance (production >= consumption)
        model.constraints[constraintName].min = 0;
      }
    });

    // Add resource constraints
    if (constraints.resources) {
      Object.keys(constraints.resources).forEach(resource => {
        const constraintName = `resource_${resource}`;
        model.constraints[constraintName] = { max: constraints.resources[resource] };
        
        this.nodes.forEach(node => {
          const recipe = this.recipes.get(node.id);
          if (recipe) {
            const input = recipe.inputs.find(i => i.name === resource);
            if (input) {
              const varName = `machine_${node.id}`;
              model.constraints[constraintName][varName] = input.quantity / recipe.duration;
            }
          }
        });
      });
    }

    return model;
  }

  /**
   * Interpret the linear programming solution
   */
  interpretSolution(solution, objective) {
    const results = {
      feasible: solution.feasible,
      optimal: true,
      objectiveValue: solution.result,
      machineAllocations: {},
      itemFlows: {},
      totalPower: 0,
      efficiency: 1.0
    };

    // Extract machine allocations
    Object.keys(solution).forEach(key => {
      if (key.startsWith('machine_')) {
        const nodeId = key.replace('machine_', '');
        results.machineAllocations[nodeId] = solution[key];
      }
    });

    // Calculate resulting item flows and power
    this.nodes.forEach(node => {
      const allocation = results.machineAllocations[node.id] || 0;
      const recipe = this.recipes.get(node.id);
      
      if (recipe && allocation > 0) {
        // Calculate power
        if (recipe.electricityConsumed > 0) {
          results.totalPower += recipe.electricityConsumed * allocation;
        }
        if (recipe.electricityGenerated > 0) {
          results.totalPower -= recipe.electricityGenerated * allocation;
        }

        // Calculate item flows
        recipe.outputs.forEach(output => {
          const flow = (output.quantity * allocation) / recipe.duration;
          results.itemFlows[output.name] = 
            (results.itemFlows[output.name] || 0) + flow;
        });
      }
    });

    return results;
  }

  /**
   * Convert rates between different time units
   */
  convertToUnits(ratePerSecond, units) {
    switch (units) {
      case 'per_second':
        return ratePerSecond;
      case 'per_minute':
        return ratePerSecond * 60;
      case 'per_hour':
        return ratePerSecond * 3600;
      default:
        return ratePerSecond;
    }
  }

  /**
   * Detect cycles in the production graph
   */
  detectCycles() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (nodeId, path) => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // Find connected nodes through edges
      this.edges
        .filter(edge => edge.source === nodeId)
        .forEach(edge => {
          dfs(edge.target, [...path, nodeId]);
        });

      recursionStack.delete(nodeId);
    };

    this.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    });

    return cycles;
  }

  /**
   * Validate production chain consistency
   */
  validateChain() {
    const issues = [];
    
    // Check for unconnected inputs/outputs
    this.items.forEach((item, itemName) => {
      if (item.producers.length === 0 && item.consumers.length > 0) {
        issues.push({
          type: 'missing_producer',
          item: itemName,
          message: `No producers found for ${itemName}`
        });
      }
      
      if (item.consumers.length === 0 && item.producers.length > 0) {
        issues.push({
          type: 'unused_output',
          item: itemName,
          message: `${itemName} is produced but not consumed`
        });
      }
    });

    // Check for cycles
    const cycles = this.detectCycles();
    if (cycles.length > 0) {
      issues.push({
        type: 'cycles_detected',
        cycles: cycles,
        message: `Detected ${cycles.length} production cycles`
      });
    }

    return issues;
  }
}

export default CalculationEngine;