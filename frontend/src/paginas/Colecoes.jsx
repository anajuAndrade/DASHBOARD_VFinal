import { useEffect, useMemo, useState } from "react";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import api from "../service/api";

function formatarNumero(valor, casas = 2) {
  if (valor === null || valor === undefined || valor === "") {
    return "—";
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "—";
  }

  return numero.toLocaleString("pt-BR", {
    maximumFractionDigits: casas,
  });
}

function nomeDaRede(chain) {
  const nomes = {
    ethereum: "Ethereum",
    solana: "Solana",
    polygon: "Polygon",
    bitcoin: "Bitcoin",
    tron: "Tron",
    bsc: "BSC",
    hyperevm: "HyperEVM",
    robinhood: "Robinhood",
  };

  return nomes[(chain || "").toLowerCase()] || chain || "Blockchain";
}

function Colecoes() {
  const [colecoes, setColecoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState("volume");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [redesSelecionadas, setRedesSelecionadas] = useState([]);

  function handleFiltrar(redes) {
    setRedesSelecionadas(redes);
  }

  useEffect(() => {
    let cancelado = false;

    async function carregarColecoes() {
      setCarregando(true);
      setErro("");

      try {
        const termo = busca.trim();
        const pesquisando = termo.length >= 2;
        const parametros = new URLSearchParams();

        if (pesquisando) {
          parametros.set("q", termo);
        }

        redesSelecionadas.forEach((rede) => {
          parametros.append("chain", rede);
        });

        const endpoint = pesquisando
          ? "/collections/search"
          : "/collections";

        const queryString = parametros.toString();
        const url = queryString
          ? `${endpoint}?${queryString}`
          : endpoint;

        const response = await api.get(url);

        if (!cancelado) {
          setColecoes(response.data.collections || []);
        }
      } catch (error) {
        console.error("Erro ao carregar coleções:", error);

        if (!cancelado) {
          setErro(
            error.response?.data?.error ||
            "Não foi possível carregar as coleções da OpenSea."
          );
          setColecoes([]);
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    const temporizador = setTimeout(carregarColecoes, 350);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [busca, redesSelecionadas]);

  const colecoesFiltradas = useMemo(() => {
    return [...colecoes].sort((a, b) => {
      if (ordenacao === "floor") {
        return (b.floor_price ?? -1) - (a.floor_price ?? -1);
      }

      if (ordenacao === "vendas") {
        return (b.sales_24h ?? -1) - (a.sales_24h ?? -1);
      }

      return (b.volume_24h ?? -1) - (a.volume_24h ?? -1);
    });
  }, [colecoes, ordenacao]);

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Navbar
          mostrarFiltro={true}
          onFiltrar={handleFiltrar}
          redesSelecionadas={redesSelecionadas}
        />

        <section className="dashboard-content collections-page">
          <header className="collections-header">
            <div>
              <span className="collections-eyebrow">
                MERCADO DE ATIVOS DIGITAIS
              </span>

              <h1>Coleções NFT</h1>

              <p>
                Explore coleções, acompanhe indicadores de mercado
                e descubra os ativos em destaque.
              </p>
            </div>
          </header>

          <div className="collections-toolbar">
            <div className="collection-search">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                placeholder="Buscar coleção por nome..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                aria-label="Buscar coleção"
              />
            </div>

            <div className="collection-sort">
              <label htmlFor="ordenacao-colecoes">
                Ordenar por
              </label>

              <select
                id="ordenacao-colecoes"
                value={ordenacao}
                onChange={(event) => setOrdenacao(event.target.value)}
              >
                <option value="volume">Maior volume em 24h</option>
                <option value="vendas">Mais vendas em 24h</option>
                <option value="floor">Maior preço mínimo</option>
              </select>
            </div>
          </div>

          {redesSelecionadas.length > 0 && (
            <div className="collections-active-filters">
              <span>Redes:</span>

              {redesSelecionadas.map((rede) => (
                <span className="collections-filter-chip" key={rede}>
                  {nomeDaRede(rede)}
                </span>
              ))}

              <button
                type="button"
                onClick={() => setRedesSelecionadas([])}
              >
                Limpar filtros
              </button>
            </div>
          )}

          {carregando && (
            <div className="collections-message">
              <div className="collections-loader" />
              <p>Carregando coleções da OpenSea...</p>
            </div>
          )}

          {!carregando && erro && (
            <div
              className="collections-message collections-error"
              role="alert"
            >
              <p>{erro}</p>
              <button
                type="button"
                onClick={() => {
                  setBusca((atual) => `${atual}`);
                  setRedesSelecionadas((atuais) => [...atuais]);
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!carregando && !erro && colecoesFiltradas.length === 0 && (
            <div className="collections-message">
              <p>
                Nenhuma coleção encontrada. Tente outro nome ou rede.
              </p>
            </div>
          )}

          {!carregando && !erro && colecoesFiltradas.length > 0 && (
            <div className="collections-grid">
              {colecoesFiltradas.map((colecao) => (
                <article
                  className="collection-card"
                  key={colecao.slug}
                >
                  <div className="collection-image-wrapper">
                    {colecao.image_url ? (
                      <img
                        className="collection-image"
                        src={colecao.image_url}
                        alt={`Imagem da coleção ${colecao.name}`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="collection-image-placeholder">
                        NFT
                      </div>
                    )}

                    <span className="collection-network">
                      {nomeDaRede(colecao.chain)}
                    </span>
                  </div>

                  <div className="collection-card-content">
                    <h2 title={colecao.name}>{colecao.name}</h2>

                    <p className="collection-description">
                      {colecao.description?.trim()
                        ? colecao.description
                          .replace(/\s+/g, " ")
                          .trim()
                        : "Sem descrição disponível para esta coleção."}
                    </p>

                    <div className="collection-stats-grid">
                      <div className="collection-stat-box">
                        <span>Preço mínimo</span>
                        <strong>
                          {formatarNumero(colecao.floor_price, 4)}
                        </strong>
                        <small>
                          {colecao.floor_price_symbol || "—"}
                        </small>
                      </div>

                      <div className="collection-stat-box">
                        <span>Volume em 24h</span>
                        <strong>
                          {formatarNumero(colecao.volume_24h, 3)}
                        </strong>
                        <small>
                          {colecao.volume_24h_symbol || "—"}
                        </small>
                      </div>

                      <div className="collection-stat-box">
                        <span>Vendas em 24h</span>
                        <strong>
                          {formatarNumero(colecao.sales_24h, 0)}
                        </strong>
                        <small>transações</small>
                      </div>

                      <div className="collection-stat-box">
                        <span>Vendas totais</span>
                        <strong>
                          {formatarNumero(colecao.total_sales, 0)}
                        </strong>
                        <small>registradas</small>
                      </div>
                    </div>

                    <a
                      className="collection-link"
                      href={
                        colecao.opensea_url ||
                        `https://opensea.io/collection/${colecao.slug}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Explorar coleção
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="collections-note">
            Dados fornecidos pela API da OpenSea. Os indicadores variam
            conforme a atividade do mercado e a disponibilidade da API.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Colecoes;
