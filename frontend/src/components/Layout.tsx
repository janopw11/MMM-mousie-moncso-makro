import { NavLink, Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { UserSwitcher } from './UserSwitcher';
import { toDateKey } from '../utils/date';

export function Layout() {
  const todayKey = toDateKey(new Date());

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src="/squirrel-icon.svg" alt="MMM squirrel mascot" />
          <div>
            <span className="brand-full">MMM</span>
            <small>Mousie Moncso Makros</small>
          </div>
        </div>
        <div className="topbar-actions">
          <UserSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <nav className="main-nav">
        <NavLink to="/week" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Week
        </NavLink>
        <NavLink to={`/day/${todayKey}`} className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Today
        </NavLink>
        <NavLink to="/meals" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Meals
        </NavLink>
        <NavLink to="/ingredients" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Ingredients
        </NavLink>
        <NavLink to="/summary" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          Weekly summary
        </NavLink>
      </nav>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
