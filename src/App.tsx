import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MealPlanner } from './pages/MealPlanner';
import { ExercisePlanner } from './pages/ExercisePlanner';
import { HealthPlanner } from './pages/HealthPlanner';
import { Account } from './pages/Account';
import { SignIn } from './pages/SignIn';
import { Register } from './pages/Register';

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/meals" element={<MealPlanner />} />
              <Route path="/exercise" element={<ExercisePlanner />} />
              <Route path="/health" element={<HealthPlanner />} />
              <Route path="/account" element={<Account />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
