import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutAppPage from './pages/AboutAppPage';
import BannerShowcasePage from './pages/BannerShowcasePage';
import DemosShowcasePage from './pages/DemosShowcasePage';
import DynamicPage from './pages/DynamicPage';
import NotFoundPage from './pages/NotFoundPage';
import VendorScriptLoader from './components/VendorScriptLoader';
import { MenuProvider } from './context/MenuContext';

export default function App() {
  return (
    <MenuProvider>
      <Router>
        <VendorScriptLoader />
        <Layout>
          <Routes>
            {/* Static Routes evaluate first */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about-app" element={<AboutAppPage />} />
            <Route path="/banner" element={<BannerShowcasePage />} />
            <Route path="/demos" element={<DemosShowcasePage />} />

            {/* Dynamic Catch-All Route for PagePilot Slugs */}
            <Route path="/:slug" element={<DynamicPage />} />

            {/* 404 Fallback Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </MenuProvider>
  );
}


