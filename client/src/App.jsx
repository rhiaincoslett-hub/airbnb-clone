import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LocationPage } from './pages/LocationPage';
import { LocationDetailsPage } from './pages/LocationDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateListingPage } from './pages/CreateListingPage';
import { UpdateListingPage } from './pages/UpdateListingPage';
import { ReservationsPage } from './pages/ReservationsPage';

/**
 * App root: AuthProvider, optional Header, and route config.
 * /admin, /admin/create, /admin/update/:id are protected.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/locations" element={<LocationPage />} />
          <Route path="/locations/:id" element={<LocationDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="host">
                <Header />
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create"
            element={
              <ProtectedRoute requireRole="host">
                <Header />
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/update/:id"
            element={
              <ProtectedRoute requireRole="host">
                <Header />
                <UpdateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
