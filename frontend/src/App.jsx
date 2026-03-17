import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import PetDetails from './pages/PetDetails';
import Register from './pages/Register';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <div className="text-7xl mb-4">🐾</div>
                <h1 className="text-3xl font-bold text-gray-700 mb-2">Page not found</h1>
                <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">
                  Go back home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          🐾 PetAdopt — Connecting loving homes with pets in need.
        </div>
      </footer>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontSize: '14px', borderRadius: '10px', padding: '12px 16px' },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />
    </div>
  );
};

export default App;
