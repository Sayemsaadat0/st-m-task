# Student Management System

A comprehensive student management system built with Next.js, featuring course management, faculty administration, student enrollment, and grade tracking.

## 🌐 Live Demo

**Live URL:** [https://st-m-task.vercel.app](https://st-m-task.vercel.app)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **MongoDB** (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd st-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following:
   ```env
   DB_USER_NAME
   DB_NAME
   DB_PASSWORD
   JWT_SECRET
   NEXT_PUBLIC_API_BASE_URL
   
   Or use a MongoDB connection string directly if you prefer.

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
  - Alert Dialog
  - Dialog
  - Label
  - Tooltip
- **Lucide React** - Icon library
- **Recharts** - Chart library for data visualization
- **Sonner** - Toast notifications
- **React CSV** - CSV export functionality

### State Management & Data Fetching
- **TanStack Query (React Query) 5.90.20** - Server state management
- **Zustand 5.0.10** - Client state management
- **Formik 2.4.9** - Form state management
- **Yup 1.7.1** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Mongoose 9.1.5** - MongoDB object modeling
- **Axios 1.13.4** - HTTP client

### Styling & UI
- **Class Variance Authority** - Component variants
- **clsx & tailwind-merge** - Conditional class utilities
- **next-themes** - Theme management
- **nextjs-toploader** - Progress indicator

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
