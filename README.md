# Osuverse

A modern web application built with Next.js and React, featuring user collections, authentication, and search functionality.

## Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Styling**: 
  - SASS/SCSS for component-specific styles
  - TailwindCSS for utility-first styling
- **State Management**: 
  - [Jotai](https://jotai.org/) for atomic state management
  - Files: [authAtom.js](/src/store/authAtom.js), [collectionAtom.js](/src/store/collectionAtom.js)
- **Database**: 
  - PostgreSQL with [Prisma ORM](https://www.prisma.io/)
  - Schema defined in [schema.prisma](/prisma/schema.prisma)
- **API Layer**: 
  - tRPC for type-safe API communication
  - React Query for server state management and caching

## Project Structure

### Core Directories

- `/app` - Next.js app directory containing pages and API routes
  - `/app/page.js` - Homepage
  - `/app/about` - About page
  - `/app/collections` - User collections page
  - `/app/search` - Search functionality
  - `/app/api` - API routes for authentication and search

### Components

Key components are located in [/src/components](/src/components):
- [Navigation.jsx](/src/components/Navigation.jsx) - Main navigation component with SCSS styling
- [SearchInput.jsx](/src/components/SearchInput.jsx) - Reusable search input component
- [UserCollectionsPanel.jsx](/src/components/UserCollectionsPanel.jsx) - Panel for managing user collections

### Authentication

Authentication is handled through:
- [/app/api/auth/route.js](/app/api/auth/route.js) - Authentication API endpoints
- [useAuth.js](/src/hooks/useAuth.js) - Custom hook for authentication state management

### Features

1. **User Authentication**
   - Custom authentication system
   - Persistent user sessions
   - Protected routes

2. **Search Functionality**
   - Dynamic search with API integration
   - Search results caching
   - Type-safe search queries

3. **User Collections**
   - Personal collection management
   - Collection sharing capabilities
   - Real-time updates using React Query

## Development

```bash
# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Environment Setup

Create a `.env` file with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/osuverse"
```

## Build and Deployment

```bash
# Create production build
npm run build

# Start production server
npm start
```

For deployment, we recommend using [Vercel](https://vercel.com) for optimal Next.js compatibility and performance.
