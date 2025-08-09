# Captain of Industry Factory Calculator

A powerful, interactive factory calculator for the game "Captain of Industry" built with React and React Flow. Design, optimize, and analyze your production chains with an intuitive node-based interface.

🌐 **[Live Demo](https://keranik.github.io/agentCalculator/)**

![CoI Factory Calculator](./docs/screenshots/coi-calculator-demo.png)

## Features

### 🏭 Core Functionality
- **Interactive Node-Based Editor**: Drag and drop machines from a comprehensive library of 349+ buildings and machines
- **Real-Time Rate Calculations**: Automatically calculate production rates, power consumption, and resource flows
- **Advanced Optimization**: Linear programming-based optimization to maximize production or minimize costs
- **Bottleneck Detection**: Identify production bottlenecks and efficiency issues
- **Validation System**: Detect missing connections, unused outputs, and production cycles

### 🎮 Game Integration
- **Complete CoI Data**: Includes all machines, recipes, and buildings from Captain of Industry Update 3
- **Accurate Game Physics**: Calculations match in-game production rates and power consumption
- **Multiple Recipe Support**: Handles alternate recipes and complex production chains
- **Categorized Machine Library**: Organized by game categories (Power, Smelting, Food, etc.)

### 🛠️ User Experience
- **Responsive Design**: Works on desktop and tablet devices
- **Dark/Light Themes**: Toggle between light and dark modes
- **Save/Load Layouts**: Export and import your factory designs as JSON
- **Unit Conversion**: Switch between per-second, per-minute, and per-hour rates
- **Zoom and Pan**: Navigate large factory layouts with ease

### ⚡ Technical Features
- **React Flow Canvas**: Smooth, interactive node manipulation
- **Zustand State Management**: Efficient state handling for complex factories
- **Math.js Integration**: Precise mathematical calculations
- **Linear Programming**: Advanced optimization using javascript-lp-solver
- **Tailwind CSS**: Modern, responsive styling

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Keranik/agentCalculator.git
cd agentCalculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Basic Usage

1. **Add Machines**: Click or drag machines from the sidebar to add them to your factory
2. **Connect Production Chains**: Use the handles on nodes to connect outputs to inputs
3. **Calculate Rates**: Click "Calculate Rates" to analyze your production chain
4. **Optimize**: Use the optimization panel to maximize production of specific items

### Advanced Features

#### Optimization
- Select an item to maximize in the optimization panel
- The system will automatically calculate optimal machine counts
- Uses linear programming to find the best solution within constraints

#### Validation
- The system automatically detects issues like:
  - Missing producers for required inputs
  - Unused outputs
  - Production cycles
  - Imbalanced flows

#### Export/Import
- Save your factory layouts as JSON files
- Share designs with other players
- Version control your factory designs

## Technical Architecture

### Tech Stack
- **Frontend**: React 18 with Vite
- **UI Framework**: React Flow for node-based interface
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Mathematics**: Math.js for calculations
- **Optimization**: javascript-lp-solver for linear programming
- **Storage**: IndexedDB for local persistence
- **Deployment**: GitHub Pages

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main control panel
│   ├── FlowCanvas.jsx   # React Flow canvas
│   ├── MachineNode.jsx  # Custom node component
│   └── Sidebar.jsx      # Machine library
├── data/               # Game data
│   ├── gameData.js     # Data transformation utilities
│   └── machines_and_buildings.json
├── stores/             # State management
│   └── flowStore.js    # Main Zustand store
├── utils/              # Utilities
│   └── calculationEngine.js # Advanced calculations
└── App.jsx             # Main application
```

### Calculation Engine

The calculator uses a sophisticated multi-layered approach:

1. **Basic Calculations**: Simple rate calculations for immediate feedback
2. **Graph Analysis**: Analyzes the production network for cycles and dependencies
3. **Linear Programming**: Solves complex optimization problems using the simplex method
4. **Validation**: Ensures production chains are feasible and complete

## Data Sources

Game data is sourced from the community-maintained [captain-of-data](https://github.com/David-Melo/captain-of-data) repository, ensuring accuracy and completeness. The data includes:

- 349+ machines and buildings
- Complete recipe database
- Power consumption/generation data
- Build costs and requirements
- Worker requirements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Reporting Issues

If you find a bug or have a feature request, please create an issue on GitHub. Include:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable

## Roadmap

- [ ] **Enhanced Optimization**: Multi-objective optimization with Pareto frontiers
- [ ] **Production Planning**: Time-based production scheduling
- [ ] **Resource Management**: Integration with mining and logistics
- [ ] **3D Visualization**: Optional 3D factory layout view
- [ ] **Multiplayer Sharing**: Real-time collaborative factory design
- [ ] **Mobile App**: Native mobile application
- [ ] **API Integration**: Direct game integration via modding API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Captain of Industry** developers for creating an amazing factory building game
- **David-Melo** for maintaining the [captain-of-data](https://github.com/David-Melo/captain-of-data) repository
- **React Flow** team for the excellent node-based UI library
- The **CoI Community** for feedback and feature requests

## Support

If you find this tool useful, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features
- 💬 Sharing feedback and suggestions
- 🤝 Contributing to the codebase

---

Built with ❤️ for the Captain of Industry community
