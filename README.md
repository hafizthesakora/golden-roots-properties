# ACDT Manager

A modern, full-stack task and project management application built with Next.js 14 and Appwrite. ACDT Manager provides teams with powerful collaboration tools including Kanban boards, table views, calendar scheduling, and real-time analytics.

## Features

### Workspace Management
- Create and manage multiple workspaces
- Invite team members with unique invite codes
- Role-based access control (Admin/Member)
- Workspace analytics and insights

### Project Organization
- Create projects within workspaces
- Custom project avatars and images
- Project-specific task organization
- Project settings and configuration

### Task Management
Three powerful views for managing tasks:
- **Kanban Board** - Drag-and-drop interface with customizable columns (Backlog, Todo, In Progress, In Review, Done)
- **Table View** - Sortable and filterable list with advanced search
- **Calendar View** - Time-based visualization with due date tracking

### Task Features
- Assign tasks to team members
- Set due dates and priorities
- Track task status through workflow stages
- Rich task descriptions
- Task filtering and search

### Team Collaboration
- Invite and manage team members
- Member profiles with avatars
- Role management and permissions
- Team member search and filtering

### Analytics & Reporting
- Workspace performance metrics
- Task completion tracking
- Project progress visualization
- Interactive charts and graphs

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library built on Radix UI

### Backend
- **Hono** - Lightweight web framework for API routes
- **Appwrite** - Backend-as-a-Service for authentication and database
- **Node.js** - Runtime environment

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### UI Libraries
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **react-big-calendar** - Calendar component
- **@hello-pangea/dnd** - Drag-and-drop functionality
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **Appwrite** instance (self-hosted or cloud)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd acdt-manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Appwrite Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id

# Database IDs
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=your-workspaces-collection-id
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=your-members-collection-id
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=your-projects-collection-id
NEXT_PUBLIC_APPWRITE_TASKS_ID=your-tasks-collection-id

# Storage
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=your-images-bucket-id

# Server-side API Key
APPWRITE_KEY=your-api-key
```

4. Configure Appwrite:
   - Create an Appwrite project
   - Set up the required database collections (workspaces, members, projects, tasks)
   - Create a storage bucket for images
   - Configure authentication methods
   - Generate an API key for server-side operations

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

Build the application:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

Start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
# or
bun start
```

## Project Structure

```
acdt-manager/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   ├── (dashboard)/              # Dashboard routes
│   │   ├── (standalone)/             # Standalone pages
│   │   └── api/[[...route]]/         # API routes (Hono)
│   │
│   ├── features/                     # Feature modules
│   │   ├── auth/                     # Authentication
│   │   ├── workspaces/               # Workspace management
│   │   ├── projects/                 # Project management
│   │   ├── tasks/                    # Task management
│   │   └── members/                  # Team member management
│   │
│   ├── components/                   # Shared components
│   │   ├── ui/                       # Shadcn/ui components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── analytics.tsx
│   │
│   ├── lib/                          # Utilities
│   │   ├── appwrite.ts               # Appwrite client
│   │   ├── rpc.ts                    # RPC client
│   │   └── utils.ts                  # Helper functions
│   │
│   └── hooks/                        # Custom React hooks
│
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

## Feature Architecture

Each feature module follows a consistent structure:

```
features/{feature-name}/
├── api/                    # Client-side React Query hooks
├── components/             # Feature-specific components
├── server/                 # Server-side API routes
├── hooks/                  # Custom hooks
├── schemas.ts              # Zod validation schemas
├── types.ts                # TypeScript type definitions
├── queries.ts              # Database queries
└── actions.ts              # Server actions
```

## Key Technologies Explained

### Appwrite
Appwrite serves as the backend, providing:
- User authentication and session management
- NoSQL database for storing data
- File storage for avatars and images
- Real-time subscriptions

### Hono Framework
Hono is used for API routes, offering:
- Type-safe routing
- Lightweight and fast performance
- Middleware support
- Perfect integration with Next.js

### React Query
TanStack Query manages server state with:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Appwrite](https://appwrite.io/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
