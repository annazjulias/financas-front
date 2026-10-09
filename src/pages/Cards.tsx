import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { apiRequest } from "../config/api";

interface Card {
  id: string;
  name: string;
  creditLimit?: number | null;
  closingDay?: number | null;
  dueDay?: number | null;
}

interface CardForm {
  name: string;
  creditLimit: string;
  closingDay: string;
  dueDay: string;
}

function Cards() {
  const [cards, setCards] = useState<Card[]>([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] =
    useState<Card | null>(null);

  const [formData, setFormData] = useState<CardForm>({
    name: "",
    creditLimit: "",
    closingDay: "",
    dueDay: "",
  });

  async function loadCards() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/api/cards");

      if (Array.isArray(data)) {
        setCards(data);
      } else if (Array.isArray(data?.cards)) {
        setCards(data.cards);
      } else {
        setCards([]);
      }
    } catch (err: any) {
      console.error(
        "ERRO AO CARREGAR CARTÕES:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível carregar os cartões."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  function handleNewCard() {
    setEditingCard(null);

    setFormData({
      name: "",
      creditLimit: "",
      closingDay: "",
      dueDay: "",
    });

    setFormError("");
    setShowForm(true);
  }

  function handleEdit(card: Card) {
    setEditingCard(card);

    setFormData({
      name: card.name,
      creditLimit:
        card.creditLimit !== null &&
        card.creditLimit !== undefined
          ? String(card.creditLimit)
          : "",
      closingDay:
        card.closingDay !== null &&
        card.closingDay !== undefined
          ? String(card.closingDay)
          : "",
      dueDay:
        card.dueDay !== null &&
        card.dueDay !== undefined
          ? String(card.dueDay)
          : "",
    });

    setFormError("");
    setShowForm(true);
  }

  function handleCloseForm() {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingCard(null);

    setFormData({
      name: "",
      creditLimit: "",
      closingDay: "",
      dueDay: "",
    });

    setFormError("");
  }

  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = formData.name.trim();

    if (!name) {
      setFormError("Informe o nome do cartão.");
      return;
    }

    const creditLimit =
      formData.creditLimit.trim() !== ""
        ? Number(
            formData.creditLimit.replace(",", ".")
          )
        : undefined;

    const closingDay =
      formData.closingDay.trim() !== ""
        ? Number(formData.closingDay)
        : undefined;

    const dueDay =
      formData.dueDay.trim() !== ""
        ? Number(formData.dueDay)
        : undefined;

    if (
      creditLimit !== undefined &&
      (Number.isNaN(creditLimit) ||
        creditLimit < 0)
    ) {
      setFormError(
        "Informe um limite de crédito válido."
      );
      return;
    }

    if (
      closingDay !== undefined &&
      (Number.isNaN(closingDay) ||
        closingDay < 1 ||
        closingDay > 31)
    ) {
      setFormError(
        "O dia de fechamento deve estar entre 1 e 31."
      );
      return;
    }

    if (
      dueDay !== undefined &&
      (Number.isNaN(dueDay) ||
        dueDay < 1 ||
        dueDay > 31)
    ) {
      setFormError(
        "O dia de vencimento deve estar entre 1 e 31."
      );
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      const body = {
        name,
        ...(creditLimit !== undefined && {
          creditLimit,
        }),
        ...(closingDay !== undefined && {
          closingDay,
        }),
        ...(dueDay !== undefined && {
          dueDay,
        }),
      };

      if (editingCard) {
        await apiRequest(
          `/api/cards/${editingCard.id}`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          }
        );
      } else {
        await apiRequest("/api/cards", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      await loadCards();

      handleCloseForm();
    } catch (err: any) {
      console.error(
        "ERRO AO SALVAR CARTÃO:",
        err
      );

      setFormError(
        err?.message ||
          "Não foi possível salvar o cartão."
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(card: Card) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o cartão "${card.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/api/cards/${card.id}`,
        {
          method: "DELETE",
        }
      );

      await loadCards();
    } catch (err: any) {
      console.error(
        "ERRO AO EXCLUIR CARTÃO:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível excluir o cartão."
      );
    }
  }

  function formatCurrency(
    value?: number | null
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Cartões</h1>
            <p>
              Gerencie seus cartões.
            </p>
          </div>
        </div>

        <div className="cards-page-card">
          <div className="cards-empty">
            <p>Carregando cartões...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>
              {editingCard
                ? "Editar cartão"
                : "Novo cartão"}
            </h1>

            <p>
              {editingCard
                ? "Atualize os dados do cartão."
                : "Cadastre um novo cartão."}
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={handleCloseForm}
            disabled={formLoading}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </div>

        <div className="cards-page-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Nome do cartão
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Ex.: Nubank"
                disabled={formLoading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="creditLimit">
                Limite de crédito
              </label>

              <input
                id="creditLimit"
                name="creditLimit"
                type="text"
                inputMode="decimal"
                value={formData.creditLimit}
                onChange={handleFormChange}
                placeholder="Ex.: 2500,00"
                disabled={formLoading}
              />
            </div>

            <div className="card-form-row">
              <div className="form-group">
                <label htmlFor="closingDay">
                  Dia de fechamento
                </label>

                <input
                  id="closingDay"
                  name="closingDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.closingDay}
                  onChange={handleFormChange}
                  placeholder="Ex.: 10"
                  disabled={formLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDay">
                  Dia de vencimento
                </label>

                <input
                  id="dueDay"
                  name="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={handleFormChange}
                  placeholder="Ex.: 17"
                  disabled={formLoading}
                />
              </div>
            </div>

            {formError && (
              <p className="error-message">
                {formError}
              </p>
            )}

            <div className="card-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCloseForm}
                disabled={formLoading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={formLoading}
              >
                {formLoading
                  ? "Salvando..."
                  : editingCard
                    ? "Salvar alterações"
                    : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Cartões</h1>
          <p>
            Gerencie seus cartões e informações
            de crédito.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleNewCard}
        >
          <Plus size={18} />
          Novo cartão
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {cards.length === 0 ? (
        <div className="cards-page-card">
          <div className="cards-empty">
            <div className="cards-empty-icon">
              <Plus size={28} />
            </div>

            <h3>Nenhum cartão cadastrado</h3>

            <p>
              Cadastre seu primeiro cartão para
              utilizá-lo nas suas transações.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleNewCard}
            >
              <Plus size={18} />
              Criar cartão
            </button>
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card) => (
            <div
              key={card.id}
              className="card-summary"
            >
              <div className="card-summary-header">
                <div>
                  <span className="card-summary-label">
                    Cartão
                  </span>

                  <h3>{card.name}</h3>
                </div>

                <div className="card-summary-actions">
                  <button
                    type="button"
                    className="card-edit-button"
                    onClick={() =>
                      handleEdit(card)
                    }
                    title="Editar cartão"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    className="card-delete-button"
                    onClick={() =>
                      handleDelete(card)
                    }
                    title="Excluir cartão"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="card-summary-info">
                <div>
                  <span>Limite</span>
                  <strong>
                    {formatCurrency(
                      card.creditLimit
                    )}
                  </strong>
                </div>

                <div>
                  <span>Fechamento</span>
                  <strong>
                    {card.closingDay
                      ? `Dia ${card.closingDay}`
                      : "Não informado"}
                  </strong>
                </div>

                <div>
                  <span>Vencimento</span>
                  <strong>
                    {card.dueDay
                      ? `Dia ${card.dueDay}`
                      : "Não informado"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cards;