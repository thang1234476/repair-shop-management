import React from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import PublicHeader from '../components/public/PublicHeader';
import PublicFooter from '../components/public/PublicFooter';
import '../styles/public-landing.css';

const PUBLIC_THEME = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#4f46e5',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#ffffff',
    borderRadius: 12,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      fontWeight: 600,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 42,
    },
    Modal: {
      borderRadius: 16,
    },
  },
};

export default function PublicLayout() {
  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ConfigProvider theme={PUBLIC_THEME}>
      <div className="public-root">
        <PublicHeader
          onScrollToSection={handleScrollToSection}
        />

        <main style={{ flex: 1 }}>
          <Outlet context={{ onScrollToSection: handleScrollToSection }} />
        </main>

        <PublicFooter
          onScrollToSection={handleScrollToSection}
        />
      </div>
    </ConfigProvider>
  );
}
