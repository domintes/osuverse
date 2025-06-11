# Osuverse Information for GitHub Copilot

## Project Overview
Osuverse is an osu! beatmap collection manager that allows users to search, organize, and manage their beatmap collections effectively. The application connects to the osu! API to fetch beatmaps and provides an interface for viewing and organizing beatmaps into customizable collections.

## Key Features
- **Beatmap Search**: Search for beatmaps by title, artist, mapper, status, and game mode
- **Collection Management**: Create, edit, and delete beatmap collections
- **Tagging System**: Add priority/value tags to beatmaps for better organization
- **Difficulty Level Management**: View and add specific difficulty levels of beatmaps to collections
- **User Authentication**: Integration with osu! user accounts

## Tech Stack
- **Frontend**: Next.js, React
- **Styling**: SCSS
- **State Management**: Jotai
- **Database**: Prisma
- **Authentication**: osu! OAuth

## Project Structure
- `app/`: Next.js app directory containing pages and API routes
- `src/components/`: React components used throughout the application
- `src/hooks/`: Custom React hooks
- `src/store/`: Jotai atoms for state management
- `public/`: Static assets
- `prisma/`: Database schema and migrations

## Key Components
- `BeatmapSearchResults`: Displays search results with expandable difficulty levels
- `OsuverseModal`: Modal dialog component used throughout the application
- `OsuversePopup`: Popup component for displaying instructions and help
- `TagInput`: Component for managing tags when adding beatmaps to collections
- `MainOsuverseDiv`: Main container with background effects

## UI Design
The application features a dark theme inspired by the osu! universe with:
- Purple and pink neon accents
- Matrix-like background effects
- Responsive design for various screen sizes
- Expandable beatmap cards showing difficulty levels

## API Integration
- `/api/auth/`: OAuth authentication endpoints
- `/api/search/`: Beatmap search endpoints
- `/api/user/`: User profile and information endpoints

## Important Workflows
1. **Search Workflow**: 
   - User enters search terms and filters
   - Results are displayed in responsive grid layout
   - Beatmaps can be expanded to show difficulty levels

2. **Collection Management Workflow**:
   - User selects beatmaps or difficulty levels to add to collections
   - Tags can be added during this process
   - Collections are stored persistently

3. **User Authentication Flow**:
   - Login through osu! OAuth
   - Token management for API requests
   - Session persistence

## Development Guidelines
- Component names use PascalCase
- SCSS files match component names with camelCase
- API routes are organized by domain in the `/api` directory
- Reusable UI components are in the `/src/components` directory
- State management uses Jotai atoms in the `/src/store` directory
