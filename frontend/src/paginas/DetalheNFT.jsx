


import { Link, useLocation } from "react-router-dom";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import "../App.css";

function formatarData(timestamp) {
  if (!timestamp) return "Não informada";

  const data = new Date(Number(timestamp) * 1000);

  return Number.isNaN(data.getTime())
    ? "Não informada"
    : data.toLocaleString("pt-BR");
}

function DetalheNFT() {
  const location = useLocation();
  const dados = location.state || {};
  const nft = dados.nft || {};
  const ehTransacao = dados.tipo === "transacao";
  const voltarPara = dados.voltarPara || "/pesquisa";

  function campo(rotulo, valor) {
    return (
      <div className="nft-detail-field" key={rotulo}>
        <span>{rotulo}</span>
        <strong>{valor || "Não informado"}</strong>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main-content">
        <Navbar mostrarFiltro={false} />
        <main className="nft-detail-page">
          <Link className="nft-back-link" to={voltarPara}>
            ← Voltar para {ehTransacao ? "transações" : "pesquisa"}
          </Link>

          <h1>
            {ehTransacao ? "Detalhes da transação" : "Detalhes do NFT"}
          </h1>

          {!dados.nft ? (
            <section className="nft-detail-card">
              <div className="nft-detail-info">
                <p>
                  Não há detalhes disponíveis nesta navegação. Volte à página
                  anterior e abra o item novamente.
                </p>
                <Link className="nft-detail-back-button" to={voltarPara}>
                  Voltar
                </Link>
              </div>
            </section>
          ) : (
            <section className="nft-detail-card">
              <div className="nft-detail-image">
                {nft.image_url ? (
                  <img src={nft.image_url} alt={nft.name || "NFT"} />
                ) : (
                  <span>Imagem não disponível</span>
                )}
              </div>

              <div className="nft-detail-info">
                <span className="transaction-chain">
                  {nft.chain || "Rede não identificada"}
                </span>

                <h2>{nft.name || "NFT sem nome"}</h2>
                <p className="nft-detail-collection">
                  {nft.collection || "Coleção não informada"}
                </p>

                <div className="nft-detail-fields">
                  {campo("Blockchain", nft.chain)}
                  {campo("Coleção", nft.collection)}
                  {campo("Identificador do NFT", nft.identifier)}
                  {campo("Contrato", nft.contract)}

                  {ehTransacao && (
                    <>
                      {campo(
                        "Preço da venda",
                        nft.price != null
                          ? `${Number(nft.price).toLocaleString("pt-BR", {
                              maximumFractionDigits: 8,
                            })} ${nft.currency || ""}`
                          : "Não informado"
                      )}

                      {campo("Data e hora", formatarData(nft.timestamp))}
                      {campo("Vendedor", nft.seller)}
                      {campo("Comprador", nft.buyer)}
                      {campo("Hash da transação", nft.transaction_hash)}
                    </>
                  )}
                </div>

                {nft.opensea_url && (
                  <a
                    className="nft-detail-external-link"
                    href={nft.opensea_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver NFT na OpenSea ↗
                  </a>
                )}

                {ehTransacao && nft.transaction_hash && (
                  <p className="nft-detail-hash-note">
                    O hash identifica a operação na blockchain.
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default DetalheNFT;
