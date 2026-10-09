
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { apiRequest } from "../config/api";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface Card {
  id: string;
  name: string;
  creditLimit?: number | string | null;
  closingDay?: number | null;
  dueDay?: number | null;
}

interface Invoice {
  id: string;
  status: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  date: string;
  type: string;
  category?: Category | null;
  paymentMethod?: PaymentMethod | null;
  card?: Card | null;
  invoice?: Invoice | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
}

interface TransactionForm {
  description: string;
  amount: string;
  date: string;
  type: "receita" | "despesa";
  categoryId: string;
  paymentMethodId: string;
  cardId: string;
  installments: string;
}

function Transactions() {
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);

  const [cards, setCards] =
    useState<Card[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [formLoading, setFormLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [formData, setFormData] =
    useState<TransactionForm>({
      description: "",
      amount: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      type: "despesa",
      categoryId: "",
      paymentMethodId: "",
      cardId: "",
      installments: "1",
    });

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/api/transactions"
      );

      const data = Array.isArray(response)
        ? response
        : response?.transactions;

      setTransactions(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as transações."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadFormData() {
    try {
      const [
        categoriesResponse,
        paymentMethodsResponse,
        cardsResponse,
      ] = await Promise.all([
        apiRequest("/api/categories"),
        apiRequest("/api/payment-methods"),
        apiRequest("/api/cards"),
      ]);

      const categoriesData =
        Array.isArray(categoriesResponse)
          ? categoriesResponse
          : categoriesResponse?.categories;

      const paymentMethodsData =
        Array.isArray(paymentMethodsResponse)
          ? paymentMethodsResponse
          : paymentMethodsResponse?.paymentMethods;

      const cardsData =
        Array.isArray(cardsResponse)
          ? cardsResponse
          : cardsResponse?.cards;

      setCategories(
        Array.isArray(categoriesData)
          ? categoriesData
          : []
      );

      setPaymentMethods(
        Array.isArray(paymentMethodsData)
          ? paymentMethodsData
          : []
      );

      setCards(
        Array.isArray(cardsData)
          ? cardsData
          : []
      );
    } catch (error) {
      console.error(error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados do formulário."
      );
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  function resetForm() {
    setFormData({
      description: "",
      amount: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      type: "despesa",
      categoryId: "",
      paymentMethodId: "",
      cardId: "",
      installments: "1",
    });

    setFormError("");
  }

  function handleNewTransaction() {
    setEditingTransaction(null);
    resetForm();
    setShowForm(true);
    loadFormData();
  }

  function handleEdit(
    transaction: Transaction
  ) {
    setEditingTransaction(transaction);

    setFormData({
      description:
        transaction.description,
      amount: String(transaction.amount),
      date: transaction.date
        ? transaction.date.substring(0, 10)
        : new Date()
            .toISOString()
            .split("T")[0],
      type:
        transaction.type === "receita"
          ? "receita"
          : "despesa",
      categoryId:
        transaction.category?.id ?? "",
      paymentMethodId:
        transaction.paymentMethod?.id ?? "",
      cardId:
        transaction.card?.id ?? "",
      installments: String(
        transaction.totalInstallments ?? 1
      ),
    });

    setFormError("");
    setShowForm(true);
    loadFormData();
  }

  function handleCloseForm() {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingTransaction(null);
    resetForm();
  }

  function handleFormChange(
    field: keyof TransactionForm,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (field === "type") {
      setFormData((previous) => ({
        ...previous,
        type:
          value === "receita"
            ? "receita"
            : "despesa",
        categoryId: "",
        cardId: "",
        installments: "1",
      }));
    }

    if (field === "paymentMethodId") {
      setFormData((previous) => ({
        ...previous,
        paymentMethodId: value,
        cardId: "",
        installments: "1",
      }));
    }
  }

  const selectedPaymentMethod =
    paymentMethods.find(
      (paymentMethod) =>
        paymentMethod.id ===
        formData.paymentMethodId
    );

  const paymentMethodName =
    selectedPaymentMethod?.name
      .trim()
      .toLowerCase();

  const isCredit =
    paymentMethodName === "crédito";

  const requiresCard =
    paymentMethodName === "crédito" ||
    paymentMethodName === "débito" ||
    paymentMethodName === "debito";

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");

    const description =
      formData.description.trim();

    const amount = Number(formData.amount);

    const installments = Number(
      formData.installments
    );

    if (!description) {
      setFormError(
        "Informe a descrição da transação."
      );
      return;
    }

    if (!formData.amount || amount <= 0) {
      setFormError(
        "Informe um valor maior que zero."
      );
      return;
    }

    if (!formData.date) {
      setFormError(
        "Informe a data da transação."
      );
      return;
    }

    if (
      !Number.isInteger(installments) ||
      installments < 1
    ) {
      setFormError(
        "O número de parcelas deve ser um número inteiro maior que zero."
      );
      return;
    }

    if (
      installments > 1 &&
      !isCredit
    ) {
      setFormError(
        "O parcelamento está disponível apenas para compras no crédito."
      );
      return;
    }

    if (
      requiresCard &&
      !formData.cardId
    ) {
      setFormError(
        "Selecione um cartão."
      );
      return;
    }

    if (
      formData.type === "receita" &&
      formData.cardId
    ) {
      setFormError(
        "Receitas não podem ser vinculadas a cartões."
      );
      return;
    }

    if (
      formData.type === "receita" &&
      installments > 1
    ) {
      setFormError(
        "Receitas não podem ser parceladas."
      );
      return;
    }

    try {
      setFormLoading(true);

      const payload: {
        description: string;
        amount: number;
        date: string;
        type: string;
        categoryId?: string;
        paymentMethodId?: string;
        cardId?: string;
        installments?: number;
      } = {
        description,
        amount,
        date: formData.date,
        type: formData.type,
      };

      if (formData.categoryId) {
        payload.categoryId =
          formData.categoryId;
      }

      if (formData.paymentMethodId) {
        payload.paymentMethodId =
          formData.paymentMethodId;
      }

      if (formData.cardId) {
        payload.cardId =
          formData.cardId;
      }

      if (isCredit) {
        payload.installments =
          installments;
      }

      if (editingTransaction) {
        await apiRequest(
          `/api/transactions/${editingTransaction.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              description,
              amount,
              date: formData.date,
              type: formData.type,
              categoryId:
                formData.categoryId || undefined,
              paymentMethodId:
                formData.paymentMethodId ||
                undefined,
              cardId:
                formData.cardId || undefined,
            }),
          }
        );
      } else {
        await apiRequest(
          "/api/transactions",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      await loadTransactions();

      handleCloseForm();
    } catch (error) {
      console.error(error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a transação."
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(
    transaction: Transaction
  ) {
    const isInstallment =
      (transaction.totalInstallments ?? 1) >
      1;

    const confirmed = window.confirm(
      isInstallment
        ? "Essa transação faz parte de uma compra parcelada. Ao excluir, todas as parcelas serão excluídas. Deseja continuar?"
        : "Deseja realmente excluir esta transação?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(
        `/api/transactions/${transaction.id}`,
        {
          method: "DELETE",
        }
      );

      await loadTransactions();
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a transação."
      );
    }
  }

  function formatCurrency(
    value: number | string
  ) {
    return Number(value).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function formatDate(date: string) {
    return new Date(
      date
    ).toLocaleDateString("pt-BR");
  }

  function getPaymentDescription(
    transaction: Transaction
  ) {
    if (!transaction.paymentMethod) {
      return "Não informado";
    }

    if (transaction.card) {
      return `${transaction.paymentMethod.name} - ${transaction.card.name}`;
    }

    return transaction.paymentMethod.name;
  }

  const filteredCategories =
    categories.filter(
      (category) =>
        category.type.toLowerCase() ===
        formData.type.toLowerCase()
    );

  return (
    <div className="page-container">
      {!showForm && (
        <>
          <div className="page-header">
            <div>
              <h1>Transações</h1>

              <p>
                Gerencie suas receitas e despesas
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleNewTransaction
              }
            >
              <Plus size={18} />
              Nova transação
            </button>
          </div>

          <div className="transactions-card">
            <div className="transactions-header">
              <h2>
                Minhas transações
              </h2>
            </div>

            {loading && (
              <div className="empty-state">
                Carregando transações...
              </div>
            )}

            {!loading && error && (
              <div className="empty-state">
                <p>{error}</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    loadTransactions
                  }
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              transactions.length ===
                0 && (
                <div className="transactions-empty">
                  <div className="transactions-empty-icon">
                    💸
                  </div>

                  <h3>
                    Nenhuma transação
                    cadastrada
                  </h3>

                  <p>
                    Cadastre sua primeira
                    receita ou despesa
                    para começar a
                    acompanhar suas
                    finanças.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      handleNewTransaction
                    }
                  >
                    <Plus size={18} />
                    Nova transação
                  </button>
                </div>
              )}

            {!loading &&
              !error &&
              transactions.length >
                0 && (
                <div className="transactions-table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>
                          Descrição
                        </th>

                        <th>
                          Data
                        </th>

                        <th>
                          Categoria
                        </th>

                        <th>
                          Pagamento
                        </th>

                        <th>
                          Valor
                        </th>

                        <th>
                          Ações
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map(
                        (transaction) => (
                          <tr
                            key={
                              transaction.id
                            }
                          >
                            <td>
                              <div>
                                <strong>
                                  {
                                    transaction.description
                                  }
                                </strong>

                                {(transaction.totalInstallments ??
                                  1) >
                                  1 && (
                                  <small>
                                    Parcela{" "}
                                    {
                                      transaction.installmentNumber
                                    }
                                    /
                                    {
                                      transaction.totalInstallments
                                    }
                                  </small>
                                )}
                              </div>
                            </td>

                            <td>
                              {formatDate(
                                transaction.date
                              )}
                            </td>

                            <td>
                              {transaction
                                .category
                                ?.name ??
                                "Sem categoria"}
                            </td>

                            <td>
                              {getPaymentDescription(
                                transaction
                              )}
                            </td>

                            <td
                              className={
                                transaction.type ===
                                "receita"
                                  ? "transaction-income"
                                  : "transaction-expense"
                              }
                            >
                              {transaction.type ===
                              "receita"
                                ? "+ "
                                : "- "}

                              {formatCurrency(
                                transaction.amount
                              )}
                            </td>

                            <td>
                              <div className="transaction-actions">
                                <button
                                  type="button"
                                  title="Editar"
                                  onClick={() =>
                                    handleEdit(
                                      transaction
                                    )
                                  }
                                >
                                  <Pencil
                                    size={
                                      17
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Excluir"
                                  onClick={() =>
                                    handleDelete(
                                      transaction
                                    )
                                  }
                                >
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </>
      )}

      {showForm && (
        <>
          <div className="page-header">
            <div>
              <h1>
                {editingTransaction
                  ? "Editar transação"
                  : "Nova transação"}
              </h1>

              <p>
                {editingTransaction
                  ? "Altere os dados da transação"
                  : "Cadastre uma nova receita ou despesa"}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleCloseForm
              }
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          </div>

          <div className="transactions-card">
            {formError && (
              <p className="error-message">
                {formError}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="transaction-type">
                  Tipo
                </label>

                <select
                  id="transaction-type"
                  value={
                    formData.type
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "type",
                      event.target.value
                    )
                  }
                  disabled={
                    formLoading
                  }
                >
                  <option value="despesa">
                    Despesa
                  </option>

                  <option value="receita">
                    Receita
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Descrição
                </label>

                <input
                  id="description"
                  type="text"
                  placeholder="Ex.: Supermercado"
                  value={
                    formData.description
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "description",
                      event.target.value
                    )
                  }
                  disabled={
                    formLoading
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount">
                  Valor
                </label>

                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={
                    formData.amount
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "amount",
                      event.target.value
                    )
                  }
                  disabled={
                    formLoading
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  Data
                </label>

                <input
                  id="date"
                  type="date"
                  value={
                    formData.date
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "date",
                      event.target.value
                    )
                  }
                  disabled={
                    formLoading
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Categoria
                </label>

                <select
                  id="category"
                  value={
                    formData.categoryId
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "categoryId",
                      event.target.value
                    )
                  }
                  disabled={
                    formLoading
                  }
                >
                  <option value="">
                    Sem categoria
                  </option>

                  {filteredCategories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="payment-method">
                  Forma de pagamento
                </label>

                <select
                  id="payment-method"
                  value={
                    formData.paymentMethodId
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "paymentMethodId",
                      event.target.value
                    )
                  }
                  disabled={
                    formLoading
                  }
                >
                  <option value="">
                    Não informado
                  </option>

                  {paymentMethods.map(
                    (paymentMethod) => (
                      <option
                        key={
                          paymentMethod.id
                        }
                        value={
                          paymentMethod.id
                        }
                      >
                        {
                          paymentMethod.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {requiresCard && (
                <div className="form-group">
                  <label htmlFor="card">
                    Cartão
                  </label>

                  <select
                    id="card"
                    value={
                      formData.cardId
                    }
                    onChange={(
                      event
                    ) =>
                      handleFormChange(
                        "cardId",
                        event.target
                          .value
                      )
                    }
                    disabled={
                      formLoading
                    }
                    required
                  >
                    <option value="">
                      Selecione um cartão
                    </option>

                    {cards.map(
                      (card) => (
                        <option
                          key={card.id}
                          value={
                            card.id
                          }
                        >
                          {card.name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {isCredit && (
                <div className="form-group">
                  <label htmlFor="installments">
                    Parcelas
                  </label>

                  <select
                    id="installments"
                    value={
                      formData.installments
                    }
                    onChange={(
                      event
                    ) =>
                      handleFormChange(
                        "installments",
                        event.target
                          .value
                      )
                    }
                    disabled={
                      formLoading
                    }
                  >
                    {Array.from(
                      {
                        length: 12,
                      },
                      (
                        _,
                        index
                      ) => (
                        <option
                          key={
                            index +
                            1
                          }
                          value={
                            index +
                            1
                          }
                        >
                          {index + 1}x
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={
                    handleCloseForm
                  }
                  disabled={
                    formLoading
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    formLoading
                  }
                >
                  {formLoading
                    ? "Salvando..."
                    : editingTransaction
                      ? "Salvar alterações"
                      : "Salvar transação"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default Transactions;
