
import type { ReactNode } from "react";

import Sidebar from "./Sidebar";

import "./MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

function MainLayout({
  children,
  currentPage,
  onNavigate,
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;

