# Algo Track - Visualize Pathfinding Algorithms in Action

Algo Track is an interactive visualization tool that brings pathfinding algorithms to life!
Designed for developers, students, and algorithm enthusiasts, this app simulates how an agent (a car) navigates through a grid-based map with obstacles, houses, and destinations.
It’s the perfect way to learn and showcase the efficiency of algorithms like A\*.

## Features

- **Interactive Grid System** (add and remove obstacles in real-time)
- **Pathfinding Algorithms** (initial implementation of A\*, with plans to add Dijkstra and BFS)
- **Dynamic Visualization** (watch the agent navigate the grid)

## Tech Stack

- **Svelte**: Framework for a reactive and efficient UI.
- **Canvas API**: Used for rendering the interactive grid.

## Deployment

- **Cloudflare Pages**: For blazing-fast, serverless deployment.

## Installation

### Prerequisites

- **Node.js**: Version 20 or later
- **npm**: Package manager for dependencies

### Clone the repository

```js
git clone https://github.com/diegosalasmartinez/algo-track.git
cd algo-track
```

### Install dependencies

```js
npm install
```

### Run on development mode

```js
npm run dev
```

### Build for production

```js
npm run build
```

## Live Demo

Check out the live version of [ALGO TRACK](https://algo-track.pages.dev/).

## Future Features

- **Algorithm Selection**: A\*, Dijkstra and BFS.
- **Thematic Maps**: Add textures and styles to the grid.
- **Analytics**: Display step-by-step calculations and algorithm comparisons.
