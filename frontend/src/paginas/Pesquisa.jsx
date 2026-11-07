
import { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import api from "../service/api";

function Pesquisa() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pesquisou, setPesquisou] = useState(false);

  async function pesquisar(event) {
    event?.preventDefault();

    const consulta = termo.trim();

    if (consulta.length < 2) {
      setErro("Digite pelo menos 2 caracteres para pesquisar.");
      setResultados([]);
      setPesquisou(false);
      return;
    }

    setCarregando(true);
    setErro("");
    setResultados([]);
    setPesquisou(true);

    try {
      const response = await api.get("/nfts/search", {
        params: { q: consulta },
      });

      setResultados(response.data.nfts || []);
    } catch (error) {
      console.error("Erro ao pesquisar NFTs:", error);

      setErro(
        error.response?.data?.error ||
        "Não foi possível pesquisar NFTs. Verifique a conexão com o servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Navbar mostrarFiltro={false} />

        <section className="dashboard-content collections-page">
          <header className="collections-header">
            <div>
              <span className="collections-eyebrow">
                EXPLORADOR DE ATIVOS DIGITAIS
              </span>

              <h1>Pesquisar NFT</h1>

              <p>
                Encontre NFTs por nome ou termo de pesquisa e explore
                seus detalhes.
              </p>
            </div>
          </header>

          <form
            className="collections-toolbar"
            onSubmit={pesquisar}
          >
            <div className="collection-search">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                placeholder="Digite o nome de um NFT..."
                value={termo}
                onChange={(event) => setTermo(event.target.value)}
                aria-label="Nome do NFT para pesquisar"
              />

              <button
                type="submit"
                className="nft-search-button"
                disabled={carregando}
                aria-label="Pesquisar NFTs"
                title="Pesquisar"
              >
                {carregando ? "…" : "⌕"}
              </button>
            </div>
          </form>

          {carregando && (
            <div className="collections-message">
              <div className="collections-loader" />
              <p>Buscando NFTs...</p>
            </div>
          )}

          {!carregando && erro && (
            <div
              className="collections-message collections-error"
              role="alert"
            >
              <p>{erro}</p>
            </div>
          )}

          {!carregando &&
            !erro &&
            pesquisou &&
            resultados.length === 0 && (
              <div className="collections-message">
                <p>Nenhum NFT encontrado para essa pesquisa.</p>
              </div>
            )}

          {!carregando &&
            !erro &&
            resultados.length > 0 && (
              <>
                <div className="collections-results-heading">
                  <h2>Resultados da pesquisa</h2>
                  <span>{resultados.length} NFTs encontrados</span>
                </div>

                <div className="collections-grid">
                  {resultados.map((nft, index) => {
                    const identificador =
                      nft.identifier ||
                      nft.token_id ||
                      nft.id;

                    const nome =
                      nft.name ||
                      `NFT #${identificador || index + 1}`;

                    return (
                      <article
                        className="collection-card"
                        key={
                          nft.id ||
                          `${nft.contract || nft.contract_address || "nft"}-${identificador || index}`
                        }
                      >
                        <div className="collection-image-wrapper">
                          {nft.image_url || nft.image ? (
                            <img
                              className="collection-image"
                              src={nft.image_url || nft.image}
                              alt={nome}
                              loading="lazy"
                            />
                          ) : (
                            <div className="collection-image-placeholder">
                              NFT
                            </div>
                          )}
                        </div>

                        <div className="collection-card-content">
                          <h2 title={nome}>{nome}</h2>

                          <p className="collection-description">
                            {nft.collection ||
                              nft.collection_name ||
                              "Coleção não informada"}
                          </p>

                          <div className="collection-stats-grid">
                            <div className="collection-stat-box">
                              <span>Blockchain</span>
                              <strong>
                                {nft.chain || "Não informada"}
                              </strong>
                            </div>

                            <div className="collection-stat-box">
                              <span>Identificador</span>
                              <strong>
                                {identificador || "—"}
                              </strong>
                            </div>
                          </div>

                          {nft.opensea_url && (
                            <a
                              className="collection-link"
                              href={nft.opensea_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver na OpenSea <span>↗</span>
                            </a>
                          )}

                          {identificador && (
                            <Link
                              className="collection-link"
                              to={`/nft/${encodeURIComponent(identificador)}`}
                              state={{ nft }}
                            >
                              Ver detalhes <span>→</span>
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

          {!carregando && !erro && !pesquisou && (
            <div className="collections-message">
              <p>
                Digite o nome de um NFT acima para começar sua pesquisa.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Pesquisa;
