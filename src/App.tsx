import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MealPlanner } from './pages/MealPlanner';
import { ExercisePlanner } from './pages/ExercisePlanner';
import { HealthPlanner } from './pages/HealthPlanner';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meals" element={<MealPlanner />} />
            <Route path="/exercise" element={<ExercisePlanner />} />
            <Route path="/health" element={<HealthPlanner />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
