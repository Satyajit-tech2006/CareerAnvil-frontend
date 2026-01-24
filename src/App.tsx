import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Home from "./pages/Home"; // Ensure you created this file from the previous step
import Dashboard from "./pages/Dashboard";
import JobBoard from "./pages/JobBoard";
import ResumeScanner from "./pages/ResumeScanner";
import ResumeBuilder from "./pages/ResumeBuilder";
import Roadmaps from "./pages/Roadmaps";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholder for future Auth logic
// Once we connect the Node.js backend, we will check for a valid token here
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = true; // Set to false to test redirecting to Home
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
          {/* --- PUBLIC ROUTE (Landing Page) --- */}
          {/* This sits OUTSIDE AppLayout so it doesn't have the sidebar */}
          <Route path="/" element={<Home />} />

          {/* --- PROTECTED ROUTES (Dashboard Ecosystem) --- */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* The user lands here after logging in */}
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