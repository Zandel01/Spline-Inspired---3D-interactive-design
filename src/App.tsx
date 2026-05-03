import { InteractiveBoxGrid } from "./components/InteractiveBoxGrid";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Force dark mode for the premium aesthetic
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <InteractiveBoxGrid />
    </main>
  );
}
