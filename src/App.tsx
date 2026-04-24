import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/Layout";
import { useProfiles } from "./contexts/ProfileContext";
import Home from "./pages/Home";
import LessonMap from "./pages/LessonMap";
import Lesson from "./pages/Lesson";
import Parents from "./pages/Parents";
import Review from "./pages/Review";
import ProfileSelect from "./pages/ProfileSelect";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const RequireProfile = ({ children }: { children: ReactNode }) => {
  const { activeId } = useProfiles();
  if (!activeId) return <Navigate to="/profili" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/profili" element={<ProfileSelect />} />
          <Route
            element={
              <RequireProfile>
                <Layout />
              </RequireProfile>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/macibas" element={<LessonMap />} />
            <Route path="/macibas/:unitId" element={<Lesson />} />
            <Route path="/atkartot" element={<Review />} />
            <Route path="/vecakiem" element={<Parents />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
