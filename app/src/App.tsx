import { HashRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-stone-50 text-stone-800">
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link
              to="/"
              className="text-base font-semibold text-emerald-700 hover:text-emerald-900 no-underline"
            >
              🌿 LivingPatch
            </Link>
            <span className="text-stone-400 text-xs">NE Pennsylvania</span>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/species/:id" element={<DetailPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
