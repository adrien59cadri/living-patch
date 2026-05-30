import { HashRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import NeighborListView from './pages/NeighborListView';
import LearnPage from './pages/LearnPage';
import SettingsPage from './pages/SettingsPage';
import LifeListPage from './pages/LifeListPage';
import { UserPreferencesProvider } from './stores/userPreferences';

// Lazy load RelationshipDiagramPage to avoid loading ForceGraph2D and THREE.js until needed
const RelationshipDiagramPage = lazy(async () => {
  const module = await import('./pages/RelationshipDiagramPage');
  return { default: module.RelationshipDiagramPage };
});

export default function App() {
  return (
    <UserPreferencesProvider>
      <HashRouter>
        <Routes>
          <Route path="/diagram" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading diagram...</div>}><RelationshipDiagramPage /></Suspense>} />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-stone-50 text-stone-800">
                <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
                  <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        to="/"
                        className="text-base font-semibold text-emerald-700 hover:text-emerald-900 no-underline"
                      >
                        🌿 LivingPatch
                      </Link>
                      <span className="text-stone-400 text-xs">NE Pennsylvania</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        to="/life-list"
                        className="text-sm text-stone-600 hover:text-emerald-700 no-underline"
                      >
                        Life List
                      </Link>
                      <Link
                        to="/learn"
                        className="text-sm text-stone-600 hover:text-emerald-700 no-underline"
                      >
                        Learn
                      </Link>
                      <Link
                        to="/settings"
                        className="text-sm text-stone-600 hover:text-emerald-700 no-underline"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                </header>
                <main className="max-w-3xl mx-auto px-4 py-6">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/life-list" element={<LifeListPage />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/species/:id" element={<DetailPage />} />
                    <Route path="/species/:id/neighbors/:category" element={<NeighborListView />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </HashRouter>
    </UserPreferencesProvider>
  );
}
