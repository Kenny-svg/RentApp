import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandlordDashboard from './pages/LandlordDashboard';
import AddPropertyPage from './pages/AddPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import PropertyListingPage from './pages/PropertyListingPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import TenantDashboard from './pages/TenantDashboard';
import ReviewPage from './pages/ReviewPage';
import LandlordProfilePage from './pages/LandlordProfilePage';
import ContactLandlordPage from './pages/ContactLandlordPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

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
            <ProtectedRoute roles={['landlord']}>
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tenant"
          element={
            <ProtectedRoute roles={['tenant']}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-property"
          element={
            <ProtectedRoute roles={['landlord']}>
              <AddPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/:propertyId/edit"
          element={
            <ProtectedRoute roles={['landlord']}>
              <EditPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route path="/properties" element={<PropertyListingPage />} />
        <Route path="/properties/:propertyId" element={<PropertyDetailsPage />} />
        <Route path="/landlords/:landlordId" element={<LandlordProfilePage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['landlord', 'tenant']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute roles={['tenant']}>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/contact/:propertyId" element={<ContactLandlordPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
