import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import InstructionDetail from "./pages/InstructionDetail";
import ThreadLibrary from "./pages/ThreadLibrary";
import OptimizationWorkspace from "./pages/OptimizationWorkspace";
import PublicEndpoint from "./pages/PublicEndpoint";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructions/:id" element={<InstructionDetail />} />
          <Route path="/threads" element={<ThreadLibrary />} />
          <Route path="/optimize" element={<OptimizationWorkspace />} />
          <Route path="/p/:slug" element={<PublicEndpoint />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
