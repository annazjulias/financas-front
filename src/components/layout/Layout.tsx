import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

import "./Layout.css";

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: ReactNode;
}

const pageInfo: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Visão geral das suas finanças",
  },

  transactions: {
    title: "Transações",
    subtitle: "Controle suas receitas e despesas",
  },

  categories: {
    title: "Categorias",
    subtitle: "Organize suas movimentações",
  },

  "payment-methods": {
    title: "Formas de pagamento",
    subtitle: "Gerencie como você realiza seus pagamentos",
  },

  cards: {
    title: "Cartões",
    subtitle: "Acompanhe seus cartões e limites",
  },

  invoices: {
    title: "Faturas",
    subtitle: "Acompanhe suas faturas",
  },

  reports: {
    title: "Relatórios",
    subtitle: "Analise sua vida financeira",
  },

  settings: {
    title: "Configurações",
    subtitle: "Gerencie as configurações da sua conta",
  },
};

function Layout({
  currentPage,
  onNavigate,
  children,
}: LayoutProps) {
  const currentPageInfo =
    pageInfo[currentPage] ?? pageInfo.dashboard;

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-content">
            <div>
              <p className="topbar-eyebrow">
                FINANÇAS
              </p>

              <h1>{currentPageInfo.title}</h1>

              <p className="topbar-subtitle">
                {currentPageInfo.subtitle}
              </p>
            </div>

            <div className="topbar-user">
              <div className="user-avatar">
                A
              </div>

              <div className="user-info">
                <strong>Minha conta</strong>
                <span>Usuário</span>
              </div>
            </div>
          </div>
        </header>

        <section className="page-content">
          {children}
        </section>
      </main>
    </div>
  );
}

export default Layout;