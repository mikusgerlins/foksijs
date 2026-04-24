import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <NavBar />
    <main className="flex-1">
      <Outlet />
    </main>
    <footer className="py-6 text-center text-xs text-muted-foreground">
      Made with 🧡 priekš mazajiem mācīšanās piedzīvojumiem
    </footer>
  </div>
);
