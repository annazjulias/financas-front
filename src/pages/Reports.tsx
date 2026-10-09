
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiRequest } from "../config/api";

interface Category {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  date: string;
  type: string;
  category?: Category | null;
  paymentMethod?: PaymentMethod | null;
}

interface MonthlyItem {
  month: string;
  receitas: number;
  despesas: number;
}

function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/api/transactions");

      const data = Array.isArray(response)
        ? response
        : response?.transactions;

      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados dos relatórios."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    transactions.forEach((transaction) => {
      if (transaction.date) {
        months.add(transaction.date.substring(0, 7));
      }
    });

    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) {
      return transactions;
    }

    return transactions.filter(
      (transaction) =>
        transaction.date &&
        transaction.date.substring(0, 7) === selectedMonth
    );
  }, [transactions, selectedMonth]);

  const totalReceitas = useMemo(() => {
    return filteredTransactions
      .filter(
        (transaction) =>
          transaction.type?.toLowerCase() === "receita"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [filteredTransactions]);

  const totalDespesas = useMemo(() => {
    return filteredTransactions
      .filter(
        (transaction) =>
          transaction.type?.toLowerCase() === "despesa"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  }, [filteredTransactions]);

  const saldo = totalReceitas - totalDespesas;

  const despesasPorCategoria = useMemo(() => {
    const values: Record<string, number> = {};

    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type?.toLowerCase() === "despesa"
      )
      .forEach((transaction) => {
        const name =
          transaction.category?.name ?? "Sem categoria";

        values[name] =
          (values[name] ?? 0) + Number(transaction.amount);
      });

    return Object.entries(values)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const despesasPorPagamento = useMemo(() => {
    const values: Record<string, number> = {};

    filteredTransactions
      .filter(
        (transaction) =>
          transaction.type?.toLowerCase() === "despesa"
      )
      .forEach((transaction) => {
        const name =
          transaction.paymentMethod?.name ?? "Não informado";

        values[name] =
          (values[name] ?? 0) + Number(transaction.amount);
      });

    return Object.entries(values)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const evolucaoMensal = useMemo(() => {
    const values: Record<string, MonthlyItem> = {};

    transactions.forEach((transaction) => {
      if (!transaction.date) {
        return;
      }

      const month = transaction.date.substring(0, 7);

      if (!values[month]) {
        values[month] = {
          month,
          receitas: 0,
          despesas: 0,
        };
      }

      const amount = Number(transaction.amount);

      if (transaction.type?.toLowerCase() === "receita") {
        values[month].receitas += amount;
      }

      if (transaction.type?.toLowerCase() === "despesa") {
        values[month].despesas += amount;
      }
    });

    return Object.values(values)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        month: formatMonth(item.month),
      }));
  }, [transactions]);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatMonth(month: string) {
    const [year, monthNumber] = month.split("-");

    const date = new Date(
      Number(year),
      Number(monthNumber) - 1,
      1
    );

    return date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  }

  function formatSelectedMonth(month: string) {
    if (!month) {
      return "Todos os meses";
    }

    return formatMonth(month);
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="empty-state">
          Carregando relatórios...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={loadTransactions}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Relatórios</h1>

          <p>
            Acompanhe suas receitas e despesas
          </p>
        </div>

        <div className="report-filter">
          <label htmlFor="report-month">
            Mês
          </label>

          <select
            id="report-month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(event.target.value)
            }
          >
            <option value="">
              Todos os meses
            </option>

            {availableMonths.map((month) => (
              <option
                key={month}
                value={month}
              >
                {formatSelectedMonth(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="reports-summary">
        <div className="report-summary-card">
          <div className="report-summary-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Total de receitas</span>

            <strong className="report-income">
              {formatCurrency(totalReceitas)}
            </strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <TrendingDown size={22} />
          </div>

          <div>
            <span>Total de despesas</span>

            <strong className="report-expense">
              {formatCurrency(totalDespesas)}
            </strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Wallet size={22} />
          </div>

          <div>
            <span>Saldo</span>

            <strong
              className={
                saldo >= 0
                  ? "report-income"
                  : "report-expense"
              }
            >
              {formatCurrency(saldo)}
            </strong>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>Despesas por categoria</h2>

              <p>
                Distribuição das despesas
              </p>
            </div>

            <BarChart3 size={20} />
          </div>

          {despesasPorCategoria.length === 0 ? (
            <div className="report-empty">
              Nenhuma despesa encontrada.
            </div>
          ) : (
            <div className="report-chart">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <PieChart>
                  <Pie
                    data={despesasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value))
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h2>
                Despesas por forma de pagamento
              </h2>

              <p>
                Onde suas despesas estão sendo
                pagas
              </p>
            </div>

            <Wallet size={20} />
          </div>

          {despesasPorPagamento.length === 0 ? (
            <div className="report-empty">
              Nenhuma despesa encontrada.
            </div>
          ) : (
            <div className="report-chart">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={despesasPorPagamento}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value))
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="value"
                    name="Despesas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="report-card report-card-full">
          <div className="report-card-header">
            <div>
              <h2>Evolução mensal</h2>

              <p>
                Comparação entre receitas e
                despesas
              </p>
            </div>

            <TrendingUp size={20} />
          </div>

          {evolucaoMensal.length === 0 ? (
            <div className="report-empty">
              Nenhuma transação encontrada.
            </div>
          ) : (
            <div className="report-chart">
              <ResponsiveContainer
                width="100%"
                height={350}
              >
                <LineChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value))
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="receitas"
                    name="Receitas"
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="despesas"
                    name="Despesas"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
