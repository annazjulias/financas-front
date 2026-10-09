
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./config/firebase";
import { apiRequest } from "./config/api";

import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import PaymentMethods from "./pages/PaymentMethods";
import Cards from "./pages/Cards";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState("dashboard");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const response = await apiRequest(
        "/auth/test"
      );

      console.log(
        "Autenticação no backend:",
        response
      );

      setAuthenticated(true);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "E-mail ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const response = await apiRequest(
        "/auth/test"
      );

      console.log(
        "Novo usuário autenticado no backend:",
        response
      );

      setAuthenticated(true);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message.includes(
          "auth/email-already-in-use"
        )
      ) {
        setError(
          "Este e-mail já está cadastrado."
        );
      } else if (
        error instanceof Error &&
        error.message.includes(
          "auth/weak-password"
        )
      ) {
        setError(
          "A senha precisa ter pelo menos 6 caracteres."
        );
      } else if (
        error instanceof Error &&
        error.message.includes(
          "auth/invalid-email"
        )
      ) {
        setError(
          "Digite um e-mail válido."
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a conta."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNavigate(page: string) {
    if (page === "logout") {
      await signOut(auth);

      setAuthenticated(false);
      setEmail("");
      setPassword("");
      setCurrentPage("dashboard");

      return;
    }

    setCurrentPage(page);
  }

  if (!authenticated) {
    return (
      <main className="login-page">
        <div className="login-card">
          <h1>Finanças</h1>

          <p className="login-subtitle">
            {isRegistering
              ? "Crie sua conta"
              : "Entre na sua conta"}
          </p>

          <form
            onSubmit={
              isRegistering
                ? handleRegister
                : handleLogin
            }
          >
            <div className="form-group">
              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Senha
              </label>

              <input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? isRegistering
                  ? "Criando conta..."
                  : "Entrando..."
                : isRegistering
                  ? "Criar conta"
                  : "Entrar"}
            </button>
          </form>

          <div className="login-switch">
            {isRegistering
              ? "Já possui uma conta?"
              : "Ainda não possui uma conta?"}

            <button
              type="button"
              className="login-switch-button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
            >
              {isRegistering
                ? "Entrar"
                : "Criar nova conta"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {currentPage === "dashboard" && (
        <Dashboard />
      )}

      {currentPage === "transactions" && (
        <Transactions />
      )}

      {currentPage === "categories" && (
        <Categories />
      )}

      {currentPage === "payment-methods" && (
        <PaymentMethods />
      )}

      {currentPage === "cards" && <Cards />}

      {currentPage === "invoices" && (
        <Invoices />
      )}

      {currentPage === "reports" && (
        <Reports />
      )}
    </Layout>
  );
}

export default App;
