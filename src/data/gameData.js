import machinesAndBuildingsData from './machines_and_buildings.json';

// Data transformation functions
export function transformGameData() {
  const { machines_and_buildings: rawData } = machinesAndBuildingsData;
  
  const machines = [];
  const recipes = [];
  const items = new Set();
  
  rawData.forEach(machine => {
    // Extract machine info
    machines.push({
      id: machine.id,
      name: machine.name,
      category: machine.category,
      workers: machine.workers,
      electricityConsumed: machine.electricity_consumed,
      electricityGenerated: machine.electricity_generated,
      computingConsumed: machine.computing_consumed,
      computingGenerated: machine.computing_generated,
      maintenanceCost: {
        units: machine.maintenance_cost_units,
        quantity: machine.maintenance_cost_quantity
      },
      buildCosts: machine.build_costs || []
    });
    
    // Extract recipes for this machine
    if (machine.recipes && machine.recipes.length > 0) {
      machine.recipes.forEach(recipe => {
        const recipeData = {
          id: `${machine.id}_${recipe.name}`,
          name: recipe.name,
          machineId: machine.id,
          machineName: machine.name,
          duration: recipe.duration,
          inputs: recipe.inputs || [],
          outputs: recipe.outputs || []
        };
        
        recipes.push(recipeData);
        
        // Collect all items
        recipe.inputs?.forEach(input => items.add(input.name));
        recipe.outputs?.forEach(output => items.add(output.name));
      });
    }
  });
  
  // Convert items set to array with metadata
  const itemsArray = Array.from(items).map(itemName => ({
    id: itemName.replace(/\s+/g, '_').toLowerCase(),
    name: itemName,
    type: inferItemType(itemName)
  }));
  
  return {
    machines,
    recipes,
    items: itemsArray
  };
}

function inferItemType(itemName) {
  const name = itemName.toLowerCase();
  
  if (name.includes('ore') || name.includes('coal') || name.includes('crude')) {
    return 'resource';
  }
  if (name.includes('steam') || name.includes('exhaust') || name.includes('hot air')) {
    return 'fluid';
  }
  if (name.includes('power') || name.includes('electricity')) {
    return 'energy';
  }
  if (name.includes('maintenance') || name.includes('unity')) {
    return 'service';
  }
  if (name.includes('parts') || name.includes('components')) {
    return 'intermediate';
  }
  
  return 'product';
}

// Get categories for organizing the sidebar
export function getCategories() {
  const { machines } = transformGameData();
  const categories = [...new Set(machines.map(m => m.category))];
  return categories.sort();
}

// Get machines by category
export function getMachinesByCategory(category) {
  const { machines } = transformGameData();
  return machines.filter(m => m.category === category);
}

// Get recipes for a specific machine
export function getRecipesForMachine(machineId) {
  const { recipes } = transformGameData();
  return recipes.filter(r => r.machineId === machineId);
}

// Get all unique items
export function getAllItems() {
  const { items } = transformGameData();
  return items;
}

// Export the transformed data
export const gameData = transformGameData();