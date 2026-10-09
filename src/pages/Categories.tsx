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
  type: "receita" | "despesa";
}

interface CategoryForm {
  name: string;
  type: "receita" | "despesa";
}

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    type: "despesa",
  });

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/api/categories");

      const data = Array.isArray(response)
        ? response
        : response.categories || [];

      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as categorias.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setFormData({
      name: "",
      type: "despesa",
    });

    setEditingCategory(null);
    setFormError("");
  }

  function handleNewCategory() {
    resetForm();
    setShowForm(true);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);

    setFormData({
      name: category.name,
      type: category.type,
    });

    setFormError("");
    setShowForm(true);
  }

  function handleCloseForm() {
    resetForm();
    setShowForm(false);
  }

  function handleFormChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");

    const name = formData.name.trim();

    if (!name) {
      setFormError("Informe o nome da categoria.");
      return;
    }

    try {
      setFormLoading(true);

      if (editingCategory) {
        await apiRequest(
          `/api/categories/${editingCategory.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name,
              type: formData.type,
            }),
          }
        );
      } else {
        await apiRequest("/api/categories", {
          method: "POST",
          body: JSON.stringify({
            name,
            type: formData.type,
          }),
        });
      }

      await loadCategories();

      handleCloseForm();
    } catch (err: any) {
      console.error("ERRO AO SALVAR CATEGORIA:", err);

      setFormError(
        err?.message ||
        (editingCategory
          ? "Não foi possível atualizar a categoria."
          : "Não foi possível criar a categoria.")
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/api/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      await loadCategories();
    } catch (err: any) {
      console.error(
        "ERRO AO EXCLUIR CATEGORIA:",
        err
      );

      setError(
        err?.message ||
        "Não foi possível excluir a categoria."
      );
    }
  }

  if (showForm) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <button
              type="button"
              className="secondary-button"
              onClick={handleCloseForm}
              style={{
                width: "auto",
                minWidth: "auto",
                padding: "0 14px",
                marginBottom: "16px",
              }}
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            <h1>
              {editingCategory
                ? "Editar categoria"
                : "Nova categoria"}
            </h1>

            <p>
              {editingCategory
                ? "Altere os dados da categoria."
                : "Cadastre uma nova categoria para suas transações."}
            </p>
          </div>
        </div>

        <div className="transactions-card">
          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="error-message">
                {formError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">
                Nome da categoria
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Ex.: Alimentação"
                disabled={formLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">
                Tipo
              </label>

              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                disabled={formLoading}
              >
                <option value="despesa">
                  Despesa
                </option>

                <option value="receita">
                  Receita
                </option>
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={formLoading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={formLoading}
              >
                {formLoading
                  ? "Salvando..."
                  : editingCategory
                    ? "Salvar alterações"
                    : "Cadastrar categoria"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const expenseCategories = categories.filter(
    (category) => category.type === "despesa"
  );

  const incomeCategories = categories.filter(
    (category) => category.type === "receita"
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Categorias</h1>

          <p>
            Organize suas receitas e despesas por categoria.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleNewCategory}
        >
          <Plus size={18} />
          Nova categoria
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transactions-card">
        <div className="transactions-header">
          <div>
            <h2>
              Categorias cadastradas
            </h2>

            <p>
              {categories.length} categoria
              {categories.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="transactions-empty">
            <p>Carregando categorias...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="transactions-empty">
            <div className="transactions-empty-icon">
              📂
            </div>

            <h3>
              Nenhuma categoria cadastrada
            </h3>

            <p>
              Crie sua primeira categoria para começar
              a organizar suas transações.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleNewCategory}
            >
              <Plus size={18} />
              Criar categoria
            </button>
          </div>
        ) : (
          <div className="categories-page-grid">
            {/* DESPESAS */}
            <div className="category-section">
              <div className="category-section-header">
                <h3>Despesas</h3>

                <span>
                  {expenseCategories.length}
                </span>
              </div>

              {expenseCategories.length === 0 ? (
                <p className="category-empty">
                  Nenhuma categoria de despesa.
                </p>
              ) : (
                <div className="category-list">
                  {expenseCategories.map(
                    (category) => (
                      <div
                        className="category-item"
                        key={category.id}
                      >
                        <div>
                          <strong>
                            {category.name}
                          </strong>

                          <span>
                            Despesa
                          </span>
                        </div>

                        <div className="category-actions">
                          <button
                            type="button"
                            className="category-edit-button"
                            onClick={() =>
                              handleEdit(category)
                            }
                            title="Editar categoria"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="category-delete-button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            title="Excluir categoria"
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

            {/* RECEITAS */}
            <div className="category-section">
              <div className="category-section-header">
                <h3>Receitas</h3>

                <span>
                  {incomeCategories.length}
                </span>
              </div>

              {incomeCategories.length === 0 ? (
                <p className="category-empty">
                  Nenhuma categoria de receita.
                </p>
              ) : (
                <div className="category-list">
                  {incomeCategories.map(
                    (category) => (
                      <div
                        className="category-item"
                        key={category.id}
                      >
                        <div>
                          <strong>
                            {category.name}
                          </strong>

                          <span>
                            Receita
                          </span>
                        </div>

                        <div className="category-actions">
                          <button
                            type="button"
                            className="category-edit-button"
                            onClick={() =>
                              handleEdit(category)
                            }
                            title="Editar categoria"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="category-delete-button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            title="Excluir categoria"
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
        )}
      </div>
    </div>
  );
}

export default Categories;