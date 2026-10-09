import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  CreditCard,
  WalletCards,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
} from "lucide-react";

import { useState } from "react";

import "./Sidebar.css";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuPrincipal = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    id: "transactions",
    label: "Transações",
    icon: ArrowLeftRight,
  },
];

const menuFinanceiro = [
  {
    id: "categories",
    label: "Categorias",
    icon: Tags,
  },

  {
    id: "cards",
    label: "Cartões",
    icon: CreditCard,
  },

  {
    id: "payment-methods",
    label: "Formas de pagamento",
    icon: WalletCards,
  },

  {
    id: "invoices",
    label: "Faturas",
    icon: Receipt,
  },

  {
    id: "reports",
    label: "Relatórios",
    icon: BarChart3,
  },
];

function Sidebar({
  currentPage,
  onNavigate,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  function handleNavigate(page: string) {
    onNavigate(page);
    setMobileOpen(false);
  }

  return (
    <>
      {/* BOTÃO MOBILE */}

      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY */}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        {/* CABEÇALHO */}

        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Wallet size={21} />
            </div>

            <div className="sidebar-brand-text">
              <strong>Finanças</strong>

              <span>
                Controle financeiro
              </span>
            </div>
          </div>

          <button
            className="mobile-close-button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* MENU */}

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">
            PRINCIPAL
          </p>

          {menuPrincipal.map((item) => {
            const Icon = item.icon;

            const active =
              currentPage === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar-link ${
                  active ? "active" : ""
                }`}
                onClick={() =>
                  handleNavigate(item.id)
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </button>
            );
          })}

          <p className="sidebar-section-title">
            FINANCEIRO
          </p>

          {menuFinanceiro.map((item) => {
            const Icon = item.icon;

            const active =
              currentPage === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar-link ${
                  active ? "active" : ""
                }`}
                onClick={() =>
                  handleNavigate(item.id)
                }
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </button>
            );
          })}

          <p className="sidebar-section-title">
            SISTEMA
          </p>

          <button
            className={`sidebar-link ${
              currentPage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigate("settings")
            }
          >
            <Settings size={19} />

            <span>Configurações</span>
          </button>
        </nav>

        {/* SAIR */}

        <div className="sidebar-footer">
          <button
            className="sidebar-logout"
            onClick={() =>
              handleNavigate("logout")
            }
          >
            <LogOut size={19} />

            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;