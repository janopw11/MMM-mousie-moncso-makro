import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WeekPage } from './pages/WeekPage';
import { DayPage } from './pages/DayPage';
import { MealsPage } from './pages/MealsPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { SummaryPage } from './pages/SummaryPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/week" replace />} />
        <Route path="week" element={<WeekPage />} />
        <Route path="day/:date" element={<DayPage />} />
        <Route path="meals" element={<MealsPage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="*" element={<Navigate to="/week" replace />} />
      </Route>
    </Routes>
  );
}
