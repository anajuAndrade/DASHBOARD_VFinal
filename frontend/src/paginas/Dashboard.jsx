import { useEffect, useState } from "react";

import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import MetricCard from "../componentes/MetricCard";
import MarketChart from "../componentes/MarketChart";
import api from "../service/api";

const REDES = [
  { id: "ethereum", nome: "Ethereum" },
  { id: "polygon", nome: "Polygon" },
  { id: "solana", nome: "Solana" },
  { id: "arbitrum", nome: "Arbitrum" },
  { id: "optimism", nome: "Optimism" },
  { id: "base", nome: "Base" },
  { id: "avalanche", nome: "Avalanche" }
];

function formatarNumero(valor, casas = 2) {
  if (valor === null || valor === undefined || valor === "") {
    return "—";
  }

  return Number(valor).toLocaleString("pt-BR", {
    maximumFractionDigits: casas
  });
}

function formatarData(timestamp) {
  if (!timestamp) {
    return "Data indisponível";
  }

  const data = new Date(
    typeof timestamp === "number"
      ? timestamp * 1000
      : timestamp
  );

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function obterPreco(payment) {
  if (!payment?.quantity) {
    return null;
  }

  const quantidade = Number(payment.quantity);
  const decimais = Number(payment.decimals ?? 18);

  if (
    !Number.isFinite(quantidade) ||
    !Number.isFinite(decimais)
  ) {
    return null;
  }

  return quantidade / Math.pow(10, decimais);
}

function Dashboard() {
  const [rede, setRede] = useState("ethereum");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  function handleFiltrar(redes) {
    setRede(redes[0] || "ethereum");
  }
  useEffect(() => {
    let ativo = true;

    async function carregarDashboard() {
      setCarregando(true);
      setErro("");
      setDados(null);

      try {
        const response = await api.get("/dashboard", {
          params: {
            chain: rede
          }
        });

        if (ativo) {
          setDados(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);

        if (ativo) {
          setErro(
            error.response?.data?.error ||
            "Não foi possível carregar os dados do dashboard."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDashboard();

    return () => {
      ativo = false;
    };
  }, [rede]);

  const metricas = dados?.metrics || {};
  const colecoes = dados?.top_collections || [];
  const trades = dados?.trades || [];
  const historico = dados?.history || [];

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Navbar
          mostrarFiltro={true}
          onFiltrar={handleFiltrar}
          redesSelecionadas={[rede]}
          selecaoUnica={true}
          redesDisponiveis={REDES} />

        <section className="dashboard-content">

          <div className="dashboard-header">
            <div>
              <h1>Dashboard</h1>
              <p>Visão geral do mercado de NFTs</p>
            </div>
          </div>

          {carregando && (
            <p>Carregando dados do mercado...</p>
          )}

          {!carregando && erro && (
            <p role="alert">{erro}</p>
          )}

          {!carregando && !erro && dados && (
            <>
              <p className="dashboard-scope">
                Analisando dados da rede{" "}
                <strong>
                  {REDES.find((item) => item.id === rede)?.nome}
                </strong>
              </p>

              <div className="metrics">
                <MetricCard
                  titulo="Vendas nas últimas 24h"
                  valor={formatarNumero(metricas.sales_24h, 0)}
                />

                <MetricCard
                  titulo="Volume nas últimas 24h"
                  valor={
                    metricas.volume_24h !== null
                      ? `${formatarNumero(metricas.volume_24h, 4)} ${metricas.volume_symbol || ""}`
                      : "—"
                  }
                />

                <MetricCard
                  titulo="Floor Price médio"
                  valor={
                    metricas.average_floor_price !== null
                      ? `${formatarNumero(metricas.average_floor_price, 4)} ETH`
                      : "—"
                  }
                />

                <MetricCard
                  titulo="Coleções consultadas"
                  valor={formatarNumero(dados.collection_count, 0)}
                />
              </div>

              <section className="market-section">
                <div className="chart-container">
                  <h2>Análise de mercado</h2>

                  <MarketChart
                    intervals={historico}
                    currency={metricas.volume_symbol || "ETH"}
                  />
                </div>

                <div className="top-collections">
                  <h2>Principais coleções</h2>

                  {colecoes.length === 0 ? (
                    <p>Nenhuma coleção encontrada.</p>
                  ) : (
                    colecoes.map((colecao) => (
                      <div
                        className="collection-item"
                        key={colecao.slug}
                      >
                        <p>
                          <strong>{colecao.name}</strong>
                        </p>

                        <p>
                          Volume 24h:{" "}
                          {colecao.volume_24h !== null
                            ? `${formatarNumero(colecao.volume_24h, 4)} ${colecao.volume_24h_symbol || ""}`
                            : "—"}
                        </p>

                        <p>
                          Vendas 24h:{" "}
                          {formatarNumero(colecao.sales_24h, 0)}
                        </p>

                        <p>
                          Floor Price:{" "}
                          {colecao.floor_price !== null
                            ? `${formatarNumero(colecao.floor_price, 4)} ${colecao.floor_price_symbol || ""}`
                            : "—"}
                        </p>

                        <a
                          href={colecao.opensea_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver coleção
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="bottom-section">
                <div className="featured">
                  <h2>Visão geral</h2>

                  <p>
                    Rede selecionada:{" "}
                    {REDES.find((item) => item.id === rede)?.nome}
                  </p>

                  <p>
                    Coleções analisadas: {dados.collection_count}
                  </p>

                  <p>
                    Coleções com Floor Price disponível:{" "}
                    {metricas.floor_collections_count}
                  </p>

                  <p>
                    Média do Floor Price:{" "}
                    {metricas.average_floor_price !== null
                      ? `${formatarNumero(metricas.average_floor_price, 4)} ETH`
                      : "—"}
                  </p>
                </div>

                <div className="transactions">
                  <h2>Transações recentes</h2>

                  {trades.length === 0 ? (
                    <p>Nenhuma venda recente retornada pela API.</p>
                  ) : (
                    trades.slice(0, 5).map((trade, index) => {
                      const nft = trade.nft || trade.asset || {};
                      const payment = trade.payment || {};
                      const preco = obterPreco(payment);

                      const identificador =
                        nft.identifier ||
                        nft.token_id ||
                        "ID indisponível";

                      const url = nft.opensea_url;

                      return (
                        <div
                          className="transaction-item"
                          key={
                            trade.transaction ||
                            `${identificador}-${index}`
                          }
                        >
                          <p>
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                NFT #{identificador}
                              </a>
                            ) : (
                              `NFT #${identificador}`
                            )}
                          </p>

                          <p>
                            Coleção:{" "}
                            {trade._collection_name || "—"}
                          </p>

                          <p>
                            Preço:{" "}
                            {preco !== null
                              ? `${formatarNumero(preco, 4)} ${payment.symbol || ""}`
                              : "Indisponível"}
                          </p>

                          <p>
                            Data:{" "}
                            {formatarData(trade.event_timestamp)}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
