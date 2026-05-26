import { HashRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import NeighborListView from './pages/NeighborListView';
import LearnPage from './pages/LearnPage';
import PacksPage from './pages/PacksPage';

export default function App() {
  return (
    <HashRouter>
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
                to="/learn"
                className="text-sm text-stone-600 hover:text-emerald-700 no-underline"
              >
                Learn
              </Link>
              <Link
                to="/packs"
                className="text-sm text-stone-600 hover:text-emerald-700 no-underline"
              >
                Packs
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/packs" element={<PacksPage />} />
            <Route path="/species/:id" element={<DetailPage />} />
            <Route path="/species/:id/neighbors/:category" element={<NeighborListView />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
