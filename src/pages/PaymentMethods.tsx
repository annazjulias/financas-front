import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "../config/api";

interface PaymentMethod {
  id: string;
  name: string;
}

interface PaymentMethodForm {
  name: string;
}

function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethod[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [formData, setFormData] =
    useState<PaymentMethodForm>({
      name: "",
    });

  async function loadPaymentMethods() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        "/api/payment-methods"
      );

      if (Array.isArray(data)) {
        setPaymentMethods(data);
      } else if (Array.isArray(data?.paymentMethods)) {
        setPaymentMethods(data.paymentMethods);
      } else {
        setPaymentMethods([]);
      }
    } catch (err: any) {
      console.error(
        "ERRO AO CARREGAR FORMAS DE PAGAMENTO:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível carregar as formas de pagamento."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  function handleNewPaymentMethod() {
    setEditingPaymentMethod(null);

    setFormData({
      name: "",
    });

    setFormError("");
    setShowForm(true);
  }

  function handleEdit(paymentMethod: PaymentMethod) {
    setEditingPaymentMethod(paymentMethod);

    setFormData({
      name: paymentMethod.name,
    });

    setFormError("");
    setShowForm(true);
  }

  function handleCloseForm() {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingPaymentMethod(null);

    setFormData({
      name: "",
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
      setFormError(
        "Informe o nome da forma de pagamento."
      );
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      if (editingPaymentMethod) {
        await apiRequest(
          `/api/payment-methods/${editingPaymentMethod.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name,
            }),
          }
        );
      } else {
        await apiRequest(
          "/api/payment-methods",
          {
            method: "POST",
            body: JSON.stringify({
              name,
            }),
          }
        );
      }

      await loadPaymentMethods();

      handleCloseForm();
    } catch (err: any) {
      console.error(
        "ERRO AO SALVAR FORMA DE PAGAMENTO:",
        err
      );

      setFormError(
        err?.message ||
          "Não foi possível salvar a forma de pagamento."
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(
    paymentMethod: PaymentMethod
  ) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a forma de pagamento "${paymentMethod.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/api/payment-methods/${paymentMethod.id}`,
        {
          method: "DELETE",
        }
      );

      await loadPaymentMethods();
    } catch (err: any) {
      console.error(
        "ERRO AO EXCLUIR FORMA DE PAGAMENTO:",
        err
      );

      setError(
        err?.message ||
          "Não foi possível excluir a forma de pagamento."
      );
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Formas de Pagamento</h1>
            <p>Gerencie suas formas de pagamento.</p>
          </div>
        </div>

        <div className="payment-methods-card">
          <div className="payment-methods-empty">
            <p>Carregando formas de pagamento...</p>
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
              {editingPaymentMethod
                ? "Editar forma de pagamento"
                : "Nova forma de pagamento"}
            </h1>

            <p>
              {editingPaymentMethod
                ? "Atualize os dados da forma de pagamento."
                : "Cadastre uma nova forma de pagamento."}
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

        <div className="payment-methods-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Nome da forma de pagamento
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Ex.: Pix"
                disabled={formLoading}
                autoFocus
              />
            </div>

            {formError && (
              <p className="error-message">
                {formError}
              </p>
            )}

            <div className="payment-method-form-actions">
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
                  : editingPaymentMethod
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
          <h1>Formas de Pagamento</h1>
          <p>
            Gerencie as formas de pagamento utilizadas
            nas suas transações.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleNewPaymentMethod}
        >
          <Plus size={18} />
          Nova forma
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      <div className="payment-methods-card">
        <div className="payment-methods-header">
          <div>
            <h2>Suas formas de pagamento</h2>
            <p>
              {paymentMethods.length === 0
                ? "Nenhuma forma cadastrada."
                : `${paymentMethods.length} forma${
                    paymentMethods.length === 1
                      ? ""
                      : "s"
                  } cadastrada${
                    paymentMethods.length === 1
                      ? ""
                      : "s"
                  }.`}
            </p>
          </div>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="payment-methods-empty">
            <div className="payment-methods-empty-icon">
              <Plus size={28} />
            </div>

            <h3>
              Nenhuma forma de pagamento
            </h3>

            <p>
              Cadastre sua primeira forma de pagamento
              para utilizá-la nas transações.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleNewPaymentMethod}
            >
              <Plus size={18} />
              Criar forma de pagamento
            </button>
          </div>
        ) : (
          <div className="payment-method-list">
            {paymentMethods.map(
              (paymentMethod) => (
                <div
                  key={paymentMethod.id}
                  className="payment-method-item"
                >
                  <div>
                    <strong>
                      {paymentMethod.name}
                    </strong>

                    <span>
                      Forma de pagamento
                    </span>
                  </div>

                  <div className="payment-method-actions">
                    <button
                      type="button"
                      className="payment-method-edit-button"
                      onClick={() =>
                        handleEdit(paymentMethod)
                      }
                      title="Editar forma de pagamento"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      className="payment-method-delete-button"
                      onClick={() =>
                        handleDelete(paymentMethod)
                      }
                      title="Excluir forma de pagamento"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentMethods;