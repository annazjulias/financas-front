import { useEffect, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Wallet,
  Receipt,
  CalendarDays,
  RefreshCw,
  CircleDollarSign,
} from "lucide-react";

import { apiRequest } from "../config/api";
import "./Dashboard.css";

interface Category {
  categoryId: string | null;
  categoryName: string;
  total: string;
}

interface PaymentMethod {
  paymentMethodId: string | null;
  paymentMethodName: string;
  total: string;
}

interface CreditCard {
  id: string;
  name: string;
  creditLimit: string | null;
  usedLimit: string;
  availableLimit: string | null;
}

interface Invoice {
  id: string;
  reference: string;
  status: string;
  closingDate: string;
  dueDate: string;
  card: {
    id: string;
    name: string;
  };
  total: string;
}

interface DashboardData {
  period: {
    startDate: string;
    endDate: string;
  };

  summary: {
    totalReceitas: string;
    totalDespesas: string;
    saldo: string;
  };

  categories: {
    income: Category[];
    expenses: Category[];
  };

  paymentMethods: PaymentMethod[];

  cards: {
    id: string;
    name: string;
    total: string;
  }[];

  creditCards: CreditCard[];

  openInvoices: Invoice[];
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

function Dashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const now = new Date();

      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const data = await apiRequest(
        `/api/dashboard/summary?month=${month}&year=${year}`
      );

      console.log("Dashboard:", data);

      setDashboard(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h2>Carregando seu dashboard</h2>

          <p>Estamos buscando suas informações financeiras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="error-icon">
            <RefreshCw size={26} />
          </div>

          <h2>Não foi possível carregar o dashboard</h2>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={loadDashboard}
          >
            <RefreshCw size={18} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {
    summary,
    categories,
    paymentMethods,
    creditCards,
    openInvoices,
  } = dashboard;

  const saldoPositivo = Number(summary.saldo) >= 0;

  const now = new Date();

  const monthName = now.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              VISÃO GERAL
            </p>

            <h1>Olá! 👋</h1>

            <p className="dashboard-subtitle">
              Aqui está um resumo das suas finanças.
            </p>
          </div>

          <div className="dashboard-period">
            <CalendarDays size={18} />

            <span>
              {monthName.charAt(0).toUpperCase() +
                monthName.slice(1)}
            </span>
          </div>
        </header>

        {/* RESUMO */}

        <section className="summary-grid">

          <div className="summary-card income-card">
            <div className="summary-card-top">
              <div className="summary-icon income-icon">
                <ArrowUpCircle size={22} />
              </div>

              <span>Receitas</span>
            </div>

            <strong>
              {formatCurrency(summary.totalReceitas)}
            </strong>

            <small>
              Entradas neste mês
            </small>
          </div>

          <div className="summary-card expense-card">
            <div className="summary-card-top">
              <div className="summary-icon expense-icon">
                <ArrowDownCircle size={22} />
              </div>

              <span>Despesas</span>
            </div>

            <strong>
              {formatCurrency(summary.totalDespesas)}
            </strong>

            <small>
              Saídas neste mês
            </small>
          </div>

          <div
            className={`summary-card balance-card ${
              saldoPositivo
                ? "balance-positive"
                : "balance-negative"
            }`}
          >
            <div className="summary-card-top">
              <div className="summary-icon balance-icon">
                <Wallet size={22} />
              </div>

              <span>Saldo</span>
            </div>

            <strong>
              {formatCurrency(summary.saldo)}
            </strong>

            <small>
              Resultado do mês
            </small>
          </div>

          <div className="summary-card invoice-card">
            <div className="summary-card-top">
              <div className="summary-icon invoice-icon">
                <Receipt size={22} />
              </div>

              <span>Faturas</span>
            </div>

            <strong>
              {openInvoices.length}
            </strong>

            <small>
              Faturas em aberto
            </small>
          </div>

        </section>

        {/* CATEGORIAS + PAGAMENTOS */}

        <section className="dashboard-grid">

          {/* CATEGORIAS */}

          <div className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Despesas por categoria</h2>
                <p>
                  Onde seu dinheiro está sendo gasto
                </p>
              </div>

              <div className="section-icon">
                <CircleDollarSign size={20} />
              </div>
            </div>

            {categories.expenses.length === 0 ? (
              <div className="empty-state">
                <CircleDollarSign size={32} />

                <p>
                  Nenhuma despesa encontrada neste período.
                </p>
              </div>
            ) : (
              <div className="category-list">
                {categories.expenses.map((category) => (
                  <div
                    className="category-item"
                    key={
                      category.categoryId ??
                      category.categoryName
                    }
                  >
                    <div className="category-left">
                      <div className="category-dot"></div>

                      <span>
                        {category.categoryName}
                      </span>
                    </div>

                    <strong className="expense">
                      {formatCurrency(category.total)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORMAS DE PAGAMENTO */}

          <div className="dashboard-card">
            <div className="section-header">
              <div>
                <h2>Formas de pagamento</h2>
                <p>
                  Como suas despesas foram pagas
                </p>
              </div>

              <div className="section-icon">
                <Wallet size={20} />
              </div>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="empty-state">
                <Wallet size={32} />

                <p>
                  Nenhum pagamento encontrado neste período.
                </p>
              </div>
            ) : (
              <div className="category-list">
                {paymentMethods.map((method) => (
                  <div
                    className="category-item"
                    key={
                      method.paymentMethodId ??
                      method.paymentMethodName
                    }
                  >
                    <div className="category-left">
                      <div className="payment-icon">
                        <Wallet size={16} />
                      </div>

                      <span>
                        {method.paymentMethodName}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(method.total)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* CARTÕES */}

        <section className="dashboard-card">
          <div className="section-header">
            <div>
              <h2>Meus cartões</h2>

              <p>
                Acompanhe seus limites e utilização
              </p>
            </div>

            <div className="section-icon">
              <CreditCard size={20} />
            </div>
          </div>

          {creditCards.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={32} />

              <p>
                Nenhum cartão cadastrado.
              </p>
            </div>
          ) : (
            <div className="cards-grid">
              {creditCards.map((card) => (
                <div
                  className="credit-card"
                  key={card.id}
                >
                  <div className="credit-card-header">
                    <div className="credit-card-icon">
                      <CreditCard size={21} />
                    </div>

                    <span>Cartão</span>
                  </div>

                  <h3>{card.name}</h3>

                  <div className="credit-card-info">
                    <div>
                      <span>Limite</span>

                      <strong>
                        {card.creditLimit !== null
                          ? formatCurrency(
                              card.creditLimit
                            )
                          : "Sem limite"}
                      </strong>
                    </div>

                    <div>
                      <span>Utilizado</span>

                      <strong>
                        {formatCurrency(
                          card.usedLimit
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Disponível</span>

                      <strong>
                        {card.availableLimit !== null
                          ? formatCurrency(
                              card.availableLimit
                            )
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  {card.creditLimit !== null && (
                    <div className="limit-bar">
                      <div
                        className="limit-bar-fill"
                        style={{
                          width: `${Math.min(
                            (Number(card.usedLimit) /
                              Number(card.creditLimit)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FATURAS */}

        <section className="dashboard-card">
          <div className="section-header">
            <div>
              <h2>Faturas</h2>

              <p>
                Acompanhe suas próximas faturas
              </p>
            </div>

            <div className="section-icon">
              <Receipt size={20} />
            </div>
          </div>

          {openInvoices.length === 0 ? (
            <div className="empty-state">
              <Receipt size={32} />

              <p>
                Nenhuma fatura aberta ou fechada.
              </p>
            </div>
          ) : (
            <div className="invoice-list">
              {openInvoices.map((invoice) => (
                <div
                  className="invoice-item"
                  key={invoice.id}
                >
                  <div className="invoice-main">
                    <div className="invoice-icon">
                      <CreditCard size={19} />
                    </div>

                    <div>
                      <strong>
                        {invoice.card.name}
                      </strong>

                      <p>
                        Fatura {invoice.reference}
                      </p>
                    </div>
                  </div>

                  <div className="invoice-date">
                    <span>Vencimento</span>

                    <strong>
                      {formatDate(invoice.dueDate)}
                    </strong>
                  </div>

                  <div className="invoice-status">
                    <span
                      className={`status-badge ${
                        invoice.status
                          .toLowerCase()
                          .includes("aberta")
                          ? "status-open"
                          : "status-other"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </div>

                  <div className="invoice-total">
                    <strong>
                      {formatCurrency(invoice.total)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Dashboard;