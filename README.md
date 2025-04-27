# Cloud Sleeping Game

A relaxing game where you control a character that can sleep on beds in a cloud-themed environment.

## Features

- Sky background with animated clouds
- Interactive curtains that can be opened and closed
- 25 draggable beds
- Character movement using WASD or arrow keys
- Character-bed collision detection
- Sleep on beds by getting close and clicking on them

## Game Controls

- **Move Character**: Arrow keys or WASD
- **Sleep on Bed**: Move close to a bed and click on it
- **Wake Up**: Click anywhere when sleeping
- **Drag Beds**: Click and drag any bed to reposition it
- **Curtains**: Click the buttons on the curtains to open/close them

## Project Structure

The game is built with Vue 3, TypeScript, and uses Canvas and SVG for rendering:

- **Background Layer**: Canvas-based sky with animated clouds
- **Bed and Character Layer**: SVG-based interactive game elements
- **Curtain Layer**: Animated curtains that can cover the game view

## Development

### Prerequisites

- Node.js (v14+ recommended)
- npm or pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Building for Production

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Implementation Details

- The game is implemented using Vue 3 Composition API
- Uses both Canvas (for background) and SVG (for game elements)
- Responsive layout that adapts to different screen sizes
- Touch-friendly for mobile devices
