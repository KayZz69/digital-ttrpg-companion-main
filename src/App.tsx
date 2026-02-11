import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { CharacterList } from "./pages/CharacterList";
import { CharacterView } from "./pages/CharacterView";
import { DiceRoller } from "./pages/DiceRoller";
import { SessionJournal } from "./pages/SessionJournal";
import { CombatTracker } from "./pages/CombatTracker";
import { NPCLibrary } from "./pages/NPCLibrary";
import { EditCharacter } from "./pages/EditCharacter";
import { Compendium } from "./pages/Compendium";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/characters" element={<CharacterList />} />
          <Route path="/character/:id" element={<CharacterView />} />
          <Route path="/character/:id/edit" element={<EditCharacter />} />
          <Route path="/character/:id/journal" element={<SessionJournal />} />
          <Route path="/character/:id/combat" element={<CombatTracker />} />
          <Route path="/dice" element={<DiceRoller />} />
          <Route path="/npc-library" element={<NPCLibrary />} />
          <Route path="/compendium" element={<Compendium />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
