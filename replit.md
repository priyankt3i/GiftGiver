# Overview

This is a full-stack Secret Santa web application built with a monorepo architecture. The application allows organizers to create Secret Santa events, generate shareable QR codes for participant registration, and manage the entire gift exchange process from setup to completion. Participants can join events via QR codes or links, submit wishlists, and view their assigned gift recipients after the draw.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, modern design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Session Management**: localStorage-based session storage for participant and organizer authentication

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Data Storage**: In-memory storage implementation with interface for easy database swapping
- **API Design**: RESTful API with proper error handling and response formatting

## Database Schema
- **Events Table**: Stores event details, organizer info, participant limits, and status
- **Participants Table**: Stores participant information, wishlists, and join timestamps  
- **Assignments Table**: Stores Secret Santa gift giver-receiver relationships after draw

## Authentication & Authorization
- **Stateless Design**: UUID-based identification for organizers and participants
- **Session Storage**: Client-side session management using localStorage
- **Role-based Access**: Separate interfaces and permissions for organizers vs participants

## Key Features
- **Event Creation**: Organizers can create events with customizable parameters
- **QR Code Generation**: Automatic QR code creation for easy participant joining
- **Real-time Updates**: Automatic polling for live participant count updates
- **Assignment Algorithm**: Shuffle-based algorithm ensuring no self-assignments
- **Responsive Design**: Mobile-first design with Christmas theming

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **drizzle-kit**: Database migration and schema management tools

## UI & Styling
- **@radix-ui/react-***: Comprehensive accessible component primitives
- **tailwindcss**: Utility-first CSS framework with custom Christmas theme
- **class-variance-authority**: Type-safe component variant handling
- **lucide-react**: Icon library for consistent iconography

## Frontend Utilities
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Zod integration for form validation
- **wouter**: Lightweight routing library
- **qrcode.react**: QR code generation for participant invites

## Development Tools
- **vite**: Fast build tool and development server
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundling for production builds