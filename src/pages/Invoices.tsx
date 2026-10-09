import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
} from "lucide-react";

import { apiRequest } from "../config/api";

interface Card {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface InvoiceTransaction {
  id: string;
  description: string;
  amount: string | number;
  date: string;
  type: "receita" | "despesa";
  category?: Category | null;
  paymentMethod?: PaymentMethod | null;
}

interface Invoice {
  id: string;
  cardId: string;
  reference: string;
  closingDate: string;
  dueDate: string;
  status: "aberta" | "fechada" | "paga";
  card: Card;
  transactions?: InvoiceTransaction[];
  total: string;
  creditLimit: string | null;
  availableLimit: string | null;
}

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/api/invoices"
      );

      if (Array.isArray(data)) {
        setInvoices(data);
      } else if (Array.isArray(data?.invoices)) {
        setInvoices(data.invoices);
      } else {
        setInvoices([]);
      }
    } catch (err: any) {
      console.error(
        "ERRO AO CARREGAR FATURAS:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível carregar as faturas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  function formatCurrency(
    value: string | number | null
  ) {
    if (
      value === null ||
      value === undefined
    ) {
      return "Não informado";
    }

    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "pt-BR"
    );
  }

  function getStatusLabel(
    status: Invoice["status"]
  ) {
    switch (status) {
      case "aberta":
        return "Aberta";

      case "fechada":
        return "Fechada";

      case "paga":
        return "Paga";

      default:
        return status;
    }
  }

  async function handleViewInvoice(
    invoiceId: string
  ) {
    try {
      setDetailsLoading(true);
      setError("");

      const data = await apiRequest(
        `/api/invoices/${invoiceId}`
      );

      setSelectedInvoice(data);
    } catch (err: any) {
      console.error(
        "ERRO AO CARREGAR DETALHES DA FATURA:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível carregar os detalhes da fatura."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handlePayInvoice(
    invoice: Invoice
  ) {
    const confirmed = window.confirm(
      `Deseja marcar a fatura de ${invoice.card.name} como paga?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const updatedInvoice =
        await apiRequest(
          `/api/invoices/${invoice.id}/pay`,
          {
            method: "PUT",
          }
        );

      setInvoices((currentInvoices) =>
        currentInvoices.map((item) =>
          item.id === invoice.id
            ? {
                ...item,
                status:
                  updatedInvoice.status ||
                  "paga",
              }
            : item
        )
      );

      if (
        selectedInvoice?.id === invoice.id
      ) {
        setSelectedInvoice((current) =>
          current
            ? {
                ...current,
                status: "paga",
              }
            : null
        );
      }
    } catch (err: any) {
      console.error(
        "ERRO AO PAGAR FATURA:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível pagar a fatura."
      );
    }
  }

  function handleBack() {
    setSelectedInvoice(null);
    setError("");
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Faturas</h1>
            <p>
              Acompanhe suas faturas de cartão.
            </p>
          </div>
        </div>

        <div className="invoices-card">
          <div className="invoices-empty">
            <p>Carregando faturas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedInvoice) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Detalhes da fatura</h1>

            <p>
              {selectedInvoice.card.name} ·{" "}
              {selectedInvoice.reference}
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        <div className="invoice-detail-card">
          <div className="invoice-detail-header">
            <div>
              <span className="invoice-label">
                Cartão
              </span>

              <h2>
                {selectedInvoice.card.name}
              </h2>

              <p>
                Fatura{" "}
                {selectedInvoice.reference}
              </p>
            </div>

            <span
              className={`invoice-status invoice-status-${selectedInvoice.status}`}
            >
              {getStatusLabel(
                selectedInvoice.status
              )}
            </span>
          </div>

          <div className="invoice-detail-summary">
            <div>
              <span>Total da fatura</span>

              <strong>
                {formatCurrency(
                  selectedInvoice.total
                )}
              </strong>
            </div>

            <div>
              <span>Fechamento</span>

              <strong>
                {formatDate(
                  selectedInvoice.closingDate
                )}
              </strong>
            </div>

            <div>
              <span>Vencimento</span>

              <strong>
                {formatDate(
                  selectedInvoice.dueDate
                )}
              </strong>
            </div>
          </div>

          <div className="invoice-limit-section">
            <div>
              <span>Limite de crédito</span>

              <strong>
                {formatCurrency(
                  selectedInvoice.creditLimit
                )}
              </strong>
            </div>

            <div>
              <span>Limite disponível</span>

              <strong>
                {formatCurrency(
                  selectedInvoice.availableLimit
                )}
              </strong>
            </div>
          </div>

          <div className="invoice-transactions-section">
            <div className="invoice-section-header">
              <div>
                <h3>Transações</h3>

                <span>
                  {selectedInvoice.transactions
                    ?.length || 0}{" "}
                  lançamento(s)
                </span>
              </div>
            </div>

            {!selectedInvoice.transactions ||
            selectedInvoice.transactions
              .length === 0 ? (
              <div className="invoice-transactions-empty">
                <p>
                  Nenhuma transação nesta fatura.
                </p>
              </div>
            ) : (
              <div className="invoice-transactions-list">
                {selectedInvoice.transactions.map(
                  (transaction) => (
                    <div
                      key={transaction.id}
                      className="invoice-transaction-item"
                    >
                      <div>
                        <strong>
                          {transaction.description}
                        </strong>

                        <span>
                          {formatDate(
                            transaction.date
                          )}

                          {transaction.category
                            ? ` · ${transaction.category.name}`
                            : ""}
                        </span>
                      </div>

                      <strong className="invoice-transaction-amount">
                        {formatCurrency(
                          transaction.amount
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {selectedInvoice.status !==
            "paga" && (
            <div className="invoice-detail-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  handlePayInvoice(
                    selectedInvoice
                  )
                }
              >
                <Check size={18} />
                Marcar como paga
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Faturas</h1>

          <p>
            Acompanhe suas faturas de cartão,
            valores e vencimentos.
          </p>
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {invoices.length === 0 ? (
        <div className="invoices-card">
          <div className="invoices-empty">
            <h3>Nenhuma fatura encontrada</h3>

            <p>
              As faturas aparecerão aqui quando
              forem geradas para seus cartões.
            </p>
          </div>
        </div>
      ) : (
        <div className="invoice-list">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="invoice-card"
            >
              <div className="invoice-card-header">
                <div>
                  <span className="invoice-label">
                    {invoice.reference}
                  </span>

                  <h3>
                    {invoice.card.name}
                  </h3>
                </div>

                <span
                  className={`invoice-status invoice-status-${invoice.status}`}
                >
                  {getStatusLabel(
                    invoice.status
                  )}
                </span>
              </div>

              <div className="invoice-card-total">
                <span>Total</span>

                <strong>
                  {formatCurrency(
                    invoice.total
                  )}
                </strong>
              </div>

              <div className="invoice-card-info">
                <div>
                  <span>Fechamento</span>

                  <strong>
                    {formatDate(
                      invoice.closingDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Vencimento</span>

                  <strong>
                    {formatDate(
                      invoice.dueDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>Limite disponível</span>

                  <strong>
                    {formatCurrency(
                      invoice.availableLimit
                    )}
                  </strong>
                </div>
              </div>

              <div className="invoice-card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    handleViewInvoice(
                      invoice.id
                    )
                  }
                  disabled={detailsLoading}
                >
                  <Eye size={17} />
                  Ver detalhes
                </button>

                {invoice.status !==
                  "paga" && (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handlePayInvoice(
                        invoice
                      )
                    }
                  >
                    <Check size={17} />
                    Pagar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Invoices;