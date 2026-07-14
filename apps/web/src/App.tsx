import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/routing/protected-route';
import { PublicOnlyRoute } from './components/routing/public-only-route';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { BuildingDetailsPage } from './pages/buildings/BuildingDetailsPage';
import { BuildingsListPage } from './pages/buildings/BuildingsListPage';
import { CreateBuildingPage } from './pages/buildings/CreateBuildingPage';
import { EditBuildingPage } from './pages/buildings/EditBuildingPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryConfigPage } from './pages/inventory-config/InventoryConfigPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PropertiesListPage } from './pages/properties/PropertiesListPage';
import { PropertyInventoryDashboardPage } from './pages/properties/PropertyInventoryDashboardPage';
import { CreateUnitPage } from './pages/units/CreateUnitPage';
import { EditUnitPage } from './pages/units/EditUnitPage';
import { UnitDetailsPage } from './pages/units/UnitDetailsPage';
import { UnitsListPage } from './pages/units/UnitsListPage';

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="properties" element={<PropertiesListPage />} />
        <Route
          path="properties/:propertyId/inventory"
          element={<PropertyInventoryDashboardPage />}
        />
        <Route path="settings" element={<ComingSoonPage title="Settings" />} />
        <Route path="units" element={<UnitsListPage />} />
        <Route path="units/new" element={<CreateUnitPage />} />
        <Route path="units/:id" element={<UnitDetailsPage />} />
        <Route path="units/:id/edit" element={<EditUnitPage />} />
        <Route path="buildings" element={<BuildingsListPage />} />
        <Route path="buildings/new" element={<CreateBuildingPage />} />
        <Route path="buildings/:id" element={<BuildingDetailsPage />} />
        <Route path="buildings/:id/edit" element={<EditBuildingPage />} />
        <Route path="inventory-config" element={<InventoryConfigPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
