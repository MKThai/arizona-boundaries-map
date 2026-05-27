/**
 * Shared page shell — navbar + area where route pages render.
 *
 * Uses React Router's `<Outlet />`, which is a placeholder that renders whichever
 * child route matches the current URL. This is like Angular's `<router-outlet />`.
 */
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.scss';

export default function Layout() {
  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">🗺️ Arizona Boundaries</div>
        <div className="nav-links">
          {/*
            NavLink is like Angular's routerLink + routerLinkActive combined.
            The function form of `className` receives `{ isActive }` so we can
            style the link for the current page.
          */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Officials
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Admin
          </NavLink>
        </div>
      </nav>

      <main>
        {/* Child routes (OfficialsList, PoliticalSnapshot) render here. */}
        <Outlet />
      </main>
    </>
  );
}
