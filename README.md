# Secret Santa Web Application

A full-stack Secret Santa web application that allows organizers to create events, generate QR codes for participant enrollment, and manage the entire gift exchange process from setup to completion.

## Features

- **Event Creation**: Organizers can create Secret Santa events with customizable parameters
- **QR Code Sharing**: Automatic QR code generation for easy participant joining
- **Participant Enrollment**: Simple registration process with wishlist submission
- **Real-time Updates**: Live participant count updates and status tracking
- **Assignment Algorithm**: Automated Secret Santa draw with smart assignment logic
- **Dual Dashboards**: Separate interfaces for organizers and participants
- **Christmas Theme**: Festive red and green design with mobile-responsive layout

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with shadcn/ui components
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **In-memory storage** (easily swappable for database)
- **RESTful API** design

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)

You can check your versions by running:
```bash
node --version
npm --version
```

## Installation & Setup

### 1. Clone or Download the Project

If you're working with this project locally, ensure you have all the files in your project directory.

### 2. Install Dependencies

Open your terminal in the project root directory and run:

```bash
npm install
```

This will install all the required dependencies for both the frontend and backend.

### 3. Environment Setup

The application is configured to work out of the box with no additional environment variables needed for local development.

### 4. Start the Development Server

#### For Mac/Linux:
```bash
npm run dev
```

#### For Windows:
If you get an error about `NODE_ENV` not being recognized, use one of these alternatives:

**Option 1 - Install cross-env (Recommended):**
```bash
npm install cross-env
```
Then run:
```bash
npx cross-env NODE_ENV=development tsx server/index.ts
```

**Option 2 - Direct command:**
```bash
npx tsx server/index.ts
```

This command will:
- Start the Express.js backend server on port 5000
- Start the Vite frontend development server
- Automatically handle proxy configuration between frontend and backend
- Enable hot reloading for development

### 5. Access the Application

Once the servers are running, open your web browser and navigate to:

```
http://localhost:5000
```

You should see the Secret Santa application homepage.

## Usage Guide

### For Organizers

1. **Create an Event**
   - Click "Create Event" on the homepage
   - Fill in event details (name, description, participant limit, etc.)
   - Set exchange date and budget information
   - Choose anonymous mode preference
   - Submit to create your event

2. **Share with Participants**
   - After creating an event, you'll be redirected to the organizer dashboard
   - Share the QR code or direct link with potential participants
   - Monitor participant enrollment in real-time

3. **Manage the Event**
   - View all enrolled participants and their wishlists
   - Perform the Secret Santa draw when ready
   - View assignment results (if not in anonymous mode)

### For Participants

1. **Join an Event**
   - Scan the QR code or click the link provided by the organizer
   - Enter your name and contact information
   - Submit your wishlist with gift preferences
   - Confirm your participation

2. **View Your Dashboard**
   - After joining, access your participant dashboard
   - See event details and your submitted wishlist
   - View your Secret Santa assignment after the draw

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions and API client
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage interface
│   └── vite.ts            # Vite integration
├── shared/                 # Shared TypeScript types
│   └── schema.ts          # Database schema and validation
└── package.json           # Dependencies and scripts
```

## API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/events` - Create a new Secret Santa event
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/participants` - Join an event as participant
- `GET /api/events/:id/participants` - Get all participants for an event
- `POST /api/events/:id/draw` - Perform Secret Santa assignments
- `GET /api/events/:id/assignments/:participantId` - Get assignment for participant

## Development

### Available Scripts

- `npm run dev` - Start development server for both frontend and backend
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

### Data Storage

The application currently uses in-memory storage for simplicity. All data is stored in memory and will be lost when the server restarts. For production use, you can easily swap this for a database by implementing the `IStorage` interface in `server/storage.ts`.

### Customization

The application is built with customization in mind:

- **Styling**: Modify `client/src/index.css` for theme changes
- **Components**: All UI components are in `client/src/components/`
- **Business Logic**: Core logic is separated in the storage and API layers
- **Validation**: Schema validation is centralized in `shared/schema.ts`

## Troubleshooting

### Common Issues

1. **Windows: 'NODE_ENV' is not recognized error**
   - This happens because Windows Command Prompt doesn't support the `NODE_ENV=development` syntax
   - **Solution**: Use the Windows-specific commands provided in step 4 above
   - Install `cross-env` with `npm install cross-env` then use `npx cross-env NODE_ENV=development tsx server/index.ts`
   - Or use the direct command: `npx tsx server/index.ts`

2. **Port Already in Use**
   - If port 5000 is already in use, stop other applications using that port
   - Or modify the port in `server/index.ts`

3. **Dependencies Not Installing**
   - Try deleting `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Server Not Starting**
   - Check that Node.js version is 18 or higher
   - Ensure all dependencies are installed

5. **Frontend Not Loading**
   - Make sure the development server started successfully
   - Check browser console for any error messages

### Getting Help

If you encounter issues:

1. Check the browser console for error messages
2. Look at the terminal output for server errors
3. Ensure all dependencies are properly installed
4. Verify Node.js version compatibility

## License

This project is built for educational and demonstration purposes. Feel free to modify and use as needed.

## Contributing

This is a demonstration project, but suggestions for improvements are welcome!