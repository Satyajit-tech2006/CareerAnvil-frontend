import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// --- PAGES ---
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import ResumeScanner from "./pages/ResumeScanner";
import NotFound from "./pages/NotFound";
import AuthSuccess from "./pages/AuthSuccess";
import JobDescriptionScanner from '@/pages/JobDescriptionScanner';

// --- LEARNING PAGES ---
import SheetLibrary from "./pages/SheetLibrary"; // Catalog
import SheetView from "./pages/SheetView";       // Study Interface
import MyLearning from "./pages/MyLearning";     // User Dashboard Tab
import NoteViewer from "./pages/NoteViewer";     // <--- NEW: Student reads notes

// --- ADMIN PAGES ---
import AdminSheetList from "./pages/admin/AdminSheetList";
import AdminSheetBuilder from "./pages/admin/AdminSheetBuilder";
import NoteBuilder from "./pages/admin/NoteBuilder"; // <--- NEW: Admin writes notes

// --- AUTH ---
import Login from "./components/Auth/Login"; 
import Signup from "./components/Auth/Signup"; 

const queryClient = new QueryClient();

/**
 * ProtectedRoute Component
 * Checks for token in Storage OR URL (Google Auth redirect)
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hasTokenInStorage = localStorage.getItem('accessToken') !== null;
  const hasTokenInUrl = location.search.includes("accessToken");
  
  if (!hasTokenInStorage && !hasTokenInUrl) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          
          {/* ==========================
              1. PUBLIC ROUTES (Accessible by everyone)
              ========================== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* ==========================
              2. PROTECTED ROUTES (Requires Login)
              ========================== */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* --- Core User Features --- */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/scanner" element={<ResumeScanner />} />
            <Route path="/jd-scanner" element={<JobDescriptionScanner />} />
            {/* --- Learning Ecosystem (Student View) --- */}
            <Route path="/sheets" element={<SheetLibrary />} />       {/* Browse Sheets */}
            <Route path="/my-learning" element={<MyLearning />} />      {/* Progress Dashboard */}
            <Route path="/sheets/:slug" element={<SheetView />} />      {/* Solve Sheet */}
            <Route path="/notes/:itemId" element={<NoteViewer />} />    {/* Read Internal Note */}

            {/* --- Admin Ecosystem (Builder View) --- */}
            {/* Ideally, wrap these in an <AdminRoute> later for extra security */}
            <Route path="/admin/sheets" element={<AdminSheetList />} />
            <Route path="/admin/sheets/:id/builder" element={<AdminSheetBuilder />} />
            <Route path="/admin/notes/:itemId" element={<NoteBuilder />} />
          </Route>

          {/* --- CATCH ALL --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;