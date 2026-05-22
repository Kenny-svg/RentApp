import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandlordDashboard from './pages/LandlordDashboard';
import AddPropertyPage from './pages/AddPropertyPage';
import PropertyListingPage from './pages/PropertyListingPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import TenantDashboard from './pages/TenantDashboard';
import ReviewPage from './pages/ReviewPage';
import LandlordProfilePage from './pages/LandlordProfilePage';
import ContactLandlordPage from './pages/ContactLandlordPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

const ALL_ROLES = ['Landlord', 'Tenant'];

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard/landlord"
          element={
            <ProtectedRoute roles={['Landlord']}>
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tenant"
          element={
            <ProtectedRoute roles={['Tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-property"
          element={
            <ProtectedRoute roles={['Landlord']}>
              <AddPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute roles={ALL_ROLES}>
              <PropertyListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId"
          element={
            <ProtectedRoute roles={ALL_ROLES}>
              <PropertyDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/landlords/:landlordId" element={<LandlordProfilePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/contact/:propertyId" element={<ContactLandlordPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
