/**
 * Root application component.
 *
 * This is the top of the React component tree. It defines:
 * - The shared page layout (navbar via <Layout />)
 * - URL-based routing (which page component to show)
 *
 * Angular equivalent: `app.ts` + `app.routes.ts` combined into one file.
 */
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import OfficialsList from './components/OfficialsList';
import PoliticalSnapshot from './components/PoliticalSnapshot';

export default function App() {
  return (
    /**
     * <Routes> maps URL paths to page components.
     * When the URL changes, React Router unmounts the old page and mounts the new one.
     */
    <Routes>
      {/*
        <Route element={...}> with nested <Route> children is the "layout route" pattern:
        Layout always renders (navbar), and an inner <Outlet /> shows the active page.
      */}
      <Route element={<Layout />}>
        <Route index element={<OfficialsList />} />
        <Route path="admin" element={<PoliticalSnapshot />} />
      </Route>
    </Routes>
  );
}
