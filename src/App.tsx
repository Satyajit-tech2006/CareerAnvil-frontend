import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import ResumeScanner from "./pages/ResumeScanner";
import ResumeBuilder from "./pages/ResumeBuilder";
import Roadmaps from "./pages/Roadmaps";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login"; 
import Signup from "./components/Auth/Signup"; 
import AuthSuccess from "./pages/AuthSuccess";

const queryClient = new QueryClient();

/**
 * ProtectedRoute Component
 * Checks local storage for authentication tokens. 
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // CRITICAL FIX: Check for 'accessToken' as well. 
  // Google Auth sets 'accessToken' first, then fetches user data.
  const isAuthenticated = 
    localStorage.getItem('accessToken') !== null || 
    localStorage.getItem('user') !== null;
  
  if (!isAuthenticated) {
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
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* NEW: Auth Success Page (Must be Public) */}
          {/* This page captures the token from the URL and saves it */}
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobBoard />} />
            <Route path="/scanner" element={<ResumeScanner />} />
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
          </Route>

          {/* --- CATCH ALL --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;