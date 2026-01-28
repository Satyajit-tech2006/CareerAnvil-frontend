import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"; // Added useLocation
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
 * ProtectedRoute Component (Fixed)
 * 1. Checks LocalStorage for a token.
 * 2. ALSO checks the URL for a token (specifically for Google Login).
 * If either exists, it lets the user pass to the Dashboard.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Check 1: Is the user already logged in?
  const hasTokenInStorage = localStorage.getItem('accessToken') !== null;

  // Check 2: Is the user COMING from Google Login? (Token is in URL)
  // We must allow this so Dashboard.jsx can load and save the token.
  const hasTokenInUrl = location.search.includes("accessToken");
  
  // If neither is true, kick them out
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
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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