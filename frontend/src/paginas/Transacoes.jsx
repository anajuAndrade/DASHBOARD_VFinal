import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import api from "../service/api";
import "../App.css";

function formatarPreco(preco, moeda) {
  if (preco === null || preco === undefined || !Number.isFinite(Number(preco))) {
    return "Preço não informado";
  }

  return `${Number(preco).toLocaleString("pt-BR", {
    maximumFractionDigits: 6,
  })} ${moeda}`;
}

function formatarData(timestamp) {
  if (!timestamp) return "Data não informada";

  const data = new Date(Number(timestamp) * 1000);

  return Number.isNaN(data.getTime())
    ? "Data não informada"
    : data.toLocaleString("pt-BR");
}

function paraTimestamp(valor) {
  if (!valor) return null;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;

  return Math.floor(data.getTime() / 1000);
}

function Transacoes() {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  async function buscarTransacoes() {
    const after = paraTimestamp(inicio);
    const before = paraTimestamp(fim);

    if (inicio && fim && after > before) {
      setErro("A data e hora inicial devem ser anteriores à data e hora final.");
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      const params = { limit: 20 };
      if (after !== null) params.after = after;
      if (before !== null) params.before = before;

      const resposta = await api.get("/transactions", { params });
      setTransacoes(resposta.data.transactions || []);
    } catch (error) {
      setErro(
        error.response?.data?.error ||
          "Não foi possível carregar as transações."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarTransacoes();
    }, []);

  function limparPeriodo() {
    setInicio("");
    setFim("");
    setTimeout(() => {
      api.get("/transactions", { params: { limit: 20 } })
        .then((resposta) => {
          setTransacoes(resposta.data.transactions || []);
          setErro("");
        })
        .catch((error) => {
          setErro(
            error.response?.data?.error ||
              "Não foi possível carregar as transações."
          );
        })
        .finally(() => setCarregando(false));
    }, 0);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main-content">
        <Navbar mostrarFiltro={false} />

        <main className="transactions-page">
          <div className="transactions-header">
            <div>
              <h1>Transações</h1>
              <p>Consulte vendas de NFTs por período.</p>
            </div>

            <button
              type="button"
              className="transactions-refresh"
              onClick={buscarTransacoes}
              disabled={carregando}
            >
              ↻ Atualizar
            </button>
          </div>

          <section className="transaction-date-filter">
            <div className="transaction-date-field">
              <label htmlFor="inicio-transacoes">De (data e hora)</label>
              <input
                id="inicio-transacoes"
                type="datetime-local"
                value={inicio}
                onChange={(event) => setInicio(event.target.value)}
              />
            </div>

            <div className="transaction-date-field">
              <label htmlFor="fim-transacoes">Até (data e hora)</label>
              <input
                id="fim-transacoes"
                type="datetime-local"
                value={fim}
                onChange={(event) => setFim(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="transactions-refresh"
              onClick={buscarTransacoes}
              disabled={carregando}
            >
              Aplicar filtro
            </button>

            <button
              type="button"
              className="transactions-clear"
              onClick={limparPeriodo}
              disabled={carregando}
            >
              Limpar
            </button>
          </section>

          <section className="transactions-summary">
            <div className="transactions-summary-card">
              <span>Vendas carregadas</span>
              <strong>{transacoes.length}</strong>
            </div>

            <div className="transactions-summary-card">
              <span>Fonte dos dados</span>
              <strong>OpenSea</strong>
            </div>
          </section>

          {carregando && (
            <p className="transactions-message">Carregando transações...</p>
          )}

          {!carregando && erro && (
            <div className="transactions-error">
              <p>{erro}</p>
            </div>
          )}

          {!carregando && !erro && transacoes.length === 0 && (
            <p className="transactions-message">
              Nenhuma venda encontrada nesse período.
            </p>
          )}

          {!carregando && !erro && transacoes.length > 0 && (
            <section className="transactions-list">
              {transacoes.map((transacao, indice) => (
                <article
                  className="transaction-item"
                  key={`${transacao.id}-${indice}`}
                >
                  <div className="transaction-image">
                    {transacao.image_url ? (
                      <img
                        src={transacao.image_url}
                        alt={transacao.name}
                        loading="lazy"
                      />
                    ) : (
                      <span>NFT</span>
                    )}
                  </div>

                  <div className="transaction-info">
                    <h3>{transacao.name}</h3>
                    <p>{transacao.collection}</p>
                    <span className="transaction-chain">
                      {transacao.chain}
                    </span>
                  </div>

                  <div className="transaction-price">
                    <span>Preço da venda</span>
                    <strong>
                      {formatarPreco(transacao.price, transacao.currency)}
                    </strong>
                  </div>

                  <div className="transaction-date">
                    <span>Data</span>
                    <strong>{formatarData(transacao.timestamp)}</strong>
                  </div>

                  <div className="transaction-actions">
                    {transacao.opensea_url && (
                      <a
                        href={transacao.opensea_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver NFT ↗
                      </a>
                    )}

                    <Link
                      to={`/nft/${encodeURIComponent(
                        transacao.identifier ?? "transacao"
                      )}`}
                      state={{
                        nft: transacao,
                        tipo: "transacao",
                        voltarPara: "/transacoes",
                      }}
                    >
                      Detalhes →
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Transacoes;
