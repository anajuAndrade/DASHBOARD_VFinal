
import { useEffect, useState } from "react";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import api from "../service/api";
import "../App.css";

function formatarDolar(valor) {
    return Number(valor || 0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
        notation: "compact",
    });
}

function formatarData(timestamp) {
    if (!timestamp) return "";

    return new Date(Number(timestamp) * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });
}

function formatarVariacao(valor) {
    if (valor === null || valor === undefined) return "Sem dados";

    const numero = Number(valor);

    if (!Number.isFinite(numero)) return "Sem dados";

    return `${numero > 0 ? "+" : ""}${numero.toFixed(2)}%`;
}

function DeFi() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await api.get("/defi/dashboard");

                if (ativo) {
                    setDados(resposta.data);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.response?.data?.error ||
                        "Não foi possível carregar os dados DeFi."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarDados();

        return () => {
            ativo = false;
        };
    }, []);

    const historico = dados?.history || [];
    const valoresTvl = historico.map((item) => Number(item.tvl || 0));

    const menorTvl = Math.min(...valoresTvl);
    const maiorTvl = Math.max(...valoresTvl);

    const variacao = maiorTvl - menorTvl;
    const margem = variacao > 0 ? variacao * 0.15 : maiorTvl * 0.01 || 1;

    const minimoGrafico = Math.max(0, menorTvl - margem);
    const maximoGrafico = maiorTvl + margem;

    const chartPoints = historico.map((item, index) => {
        const x = 30 + (index / Math.max(historico.length - 1, 1)) * 840;

        const y =
            205 -
            ((Number(item.tvl) - minimoGrafico) /
                (maximoGrafico - minimoGrafico || 1)) *
            170;

        return {
            x,
            y,
            tvl: Number(item.tvl),
            date: item.date,
        };
    });

    const pontosLinha = chartPoints
        .map((ponto) => `${ponto.x},${ponto.y}`)
        .join(" ");

    const areaGrafico = chartPoints.length
        ? `30,205 ${pontosLinha} 870,205`
        : "";
    return (
        <div className="app">
            <Sidebar />

            <div className="main-content">
                <Navbar mostrarFiltro={false} />

                <main className="defi-page">
                    <div className="defi-header">
                        <div>
                            <h1>DeFi</h1>
                            <p>
                                Acompanhe o mercado de finanças descentralizadas.
                            </p>
                        </div>

                        <span className="defi-source">
                            Dados: {dados?.source || "DeFiLlama"}
                        </span>
                    </div>

                    {carregando && (
                        <p className="defi-message">
                            Carregando indicadores do mercado DeFi...
                        </p>
                    )}

                    {!carregando && erro && (
                        <div className="defi-error">
                            <p>{erro}</p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!carregando && !erro && dados && (
                        <>
                            <section className="defi-metrics">
                                <article className="defi-metric-card">
                                    <span>TVL agregado do mercado</span>
                                    <strong>
                                        {formatarDolar(
                                            historico.length
                                                ? historico[historico.length - 1].tvl
                                                : 0
                                        )}
                                    </strong>
                                    <small>Histórico agregado da DeFiLlama</small>
                                </article>

                                <article className="defi-metric-card">
                                    <span>Protocolos acompanhados</span>
                                    <strong>
                                        {Number(
                                            dados.summary?.protocols_count || 0
                                        ).toLocaleString("pt-BR")}
                                    </strong>
                                    <small>Protocolos retornados pela API</small>
                                </article>

                                <article className="defi-metric-card">
                                    <span>Volume DEX (24h)</span>
                                    <strong>
                                        {formatarDolar(
                                            dados.summary?.dex_volume_24h
                                        )}
                                    </strong>
                                    <small>Volume agregado de DEX</small>
                                </article>

                                <article className="defi-metric-card">
                                    <span>Taxas (24h)</span>
                                    <strong>
                                        {formatarDolar(
                                            dados.summary?.fees_24h
                                        )}
                                    </strong>
                                    <small>Taxas geradas pelos protocolos</small>
                                </article>
                            </section>

                            <section className="defi-section">
                                <div className="defi-section-header">
                                    <div>
                                        <h2>Evolução do TVL</h2>
                                        <p>
                                            Histórico agregado do valor bloqueado no mercado DeFi.
                                        </p>
                                    </div>

                                    <span className="defi-chart-period">
                                        Últimos {historico.length} registros
                                    </span>
                                </div>

                                {historico.length > 1 ? (
                                    <div className="defi-line-chart">
                                        <svg
                                            viewBox="0 0 900 250"
                                            preserveAspectRatio="none"
                                            role="img"
                                            aria-label="Gráfico de evolução histórica do TVL"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="defiAreaGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop offset="0%" stopColor="#8050ef" stopOpacity="0.35" />
                                                    <stop offset="100%" stopColor="#8050ef" stopOpacity="0.01" />
                                                </linearGradient>
                                            </defs>

                                            {[35, 90, 145, 205].map((y) => (
                                                <line
                                                    key={y}
                                                    x1="30"
                                                    y1={y}
                                                    x2="870"
                                                    y2={y}
                                                    stroke="#393b48"
                                                    strokeDasharray="4 5"
                                                />
                                            ))}

                                            <polygon
                                                points={areaGrafico}
                                                fill="url(#defiAreaGradient)"
                                            />

                                            <polyline
                                                points={pontosLinha}
                                                fill="none"
                                                stroke="#9868ff"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                vectorEffect="non-scaling-stroke"
                                            />

                                            {chartPoints.map((ponto, index) => (
                                                <circle
                                                    key={`${ponto.date}-${index}`}
                                                    cx={ponto.x}
                                                    cy={ponto.y}
                                                    r="3.5"
                                                    fill="#b99aff"
                                                    stroke="#17181f"
                                                    strokeWidth="2"
                                                    vectorEffect="non-scaling-stroke"
                                                >
                                                    <title>
                                                        {formatarData(ponto.date)} — {formatarDolar(ponto.tvl)}
                                                    </title>
                                                </circle>
                                            ))}
                                        </svg>

                                        <div className="defi-chart-dates">
                                            {chartPoints.map((ponto, index) => {
                                                const ultimo = index === chartPoints.length - 1;
                                                const primeiro = index === 0;

                                                if (!primeiro && !ultimo && index % 5 !== 0) {
                                                    return null;
                                                }

                                                return (
                                                    <span key={`${ponto.date}-${index}`}>
                                                        {formatarData(ponto.date)}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="defi-message">
                                        Não há registros suficientes para montar o gráfico.
                                    </p>
                                )}

                                <p className="defi-chart-caption">
                                    Valores em dólares americanos (USD). A escala vertical destaca
                                    as variações dentro do período selecionado.
                                </p>
                            </section>

                            <div className="defi-two-columns">
                                <section className="defi-section">
                                    <div className="defi-section-header">
                                        <div>
                                            <h2>Principais protocolos</h2>
                                            <p>Ordenados pelo valor total bloqueado.</p>
                                        </div>
                                    </div>

                                    <div className="defi-table-wrapper">
                                        <table className="defi-table">
                                            <thead>
                                                <tr>
                                                    <th>Protocolo</th>
                                                    <th>Categoria</th>
                                                    <th>TVL</th>
                                                    <th>24h</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {dados.protocols.map((protocolo) => (
                                                    <tr key={protocolo.id}>
                                                        <td>
                                                            <div className="defi-protocol">
                                                                {protocolo.logo && (
                                                                    <img
                                                                        src={protocolo.logo}
                                                                        alt=""
                                                                        loading="lazy"
                                                                    />
                                                                )}
                                                                <span>{protocolo.name}</span>
                                                            </div>
                                                        </td>

                                                        <td>{protocolo.category || "—"}</td>

                                                        <td>{formatarDolar(protocolo.tvl)}</td>

                                                        <td
                                                            className={
                                                                Number(protocolo.change_1d) >= 0
                                                                    ? "defi-positive"
                                                                    : "defi-negative"
                                                            }
                                                        >
                                                            {formatarVariacao(protocolo.change_1d)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <section className="defi-section">
                                    <div className="defi-section-header">
                                        <div>
                                            <h2>TVL por blockchain</h2>
                                            <p>Redes com maior valor bloqueado.</p>
                                        </div>
                                    </div>

                                    <div className="defi-chain-list">
                                        {dados.chains.map((rede, indice) => (
                                            <div
                                                className="defi-chain-item"
                                                key={rede.name}
                                            >
                                                <div className="defi-chain-number">
                                                    {indice + 1}
                                                </div>

                                                <div className="defi-chain-info">
                                                    <strong>{rede.name}</strong>
                                                    <div className="defi-chain-progress">
                                                        <div
                                                            style={{
                                                                width: `${(rede.tvl /
                                                                    Math.max(
                                                                        ...dados.chains.map(
                                                                            (item) => item.tvl
                                                                        ),
                                                                        1
                                                                    )) *
                                                                    100
                                                                    }%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <strong>{formatarDolar(rede.tvl)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                            <section className="blockchain-info">
                                <h2>Sobre DeFi</h2>

                                <div className="blockchain-info-content">
                                    <div>
                                        <h3>O que é DeFi?</h3>
                                        <p>
                                            DeFi, ou Finanças Descentralizadas, é um conjunto de serviços
                                            financeiros desenvolvidos sobre redes blockchain, que permite
                                            realizar operações sem depender diretamente de instituições
                                            financeiras tradicionais. Essas operações são executadas por
                                            meio de contratos inteligentes, que automatizam regras e
                                            transações.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Como funciona?</h3>
                                        <p>
                                            As aplicações DeFi utilizam contratos inteligentes para
                                            disponibilizar serviços como empréstimos, negociações de
                                            criptomoedas e fornecimento de liquidez. Os usuários interagem
                                            diretamente com essas aplicações por meio de carteiras
                                            digitais, mantendo o controle de seus próprios ativos.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Principais aplicações</h3>
                                        <p>
                                            Entre as aplicações mais comuns estão as exchanges
                                            descentralizadas (DEX), plataformas de empréstimos e
                                            financiamentos, protocolos de staking e pools de liquidez.
                                            Esses serviços permitem diferentes formas de movimentação e
                                            utilização de ativos digitais.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Indicadores e importância</h3>
                                        <p>
                                            Um dos principais indicadores utilizados para acompanhar o
                                            setor é o TVL (Total Value Locked), que representa o valor
                                            total de ativos depositados nos contratos inteligentes de
                                            determinado protocolo. Esse indicador ajuda a analisar a
                                            participação e a atividade econômica das aplicações DeFi.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Riscos e desafios</h3>
                                        <p>
                                            Apesar das possibilidades oferecidas, o setor apresenta
                                            riscos, como falhas em contratos inteligentes, ataques
                                            cibernéticos, golpes, volatilidade dos ativos e problemas
                                            relacionados à liquidez. Por isso, a segurança e a auditoria
                                            dos protocolos são aspectos importantes.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <p className="defi-disclaimer">
                                Fonte: DeFiLlama. Os indicadores refletem os dados
                                disponibilizados pela API e podem apresentar diferenças
                                de metodologia entre protocolos e blockchains.
                            </p>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default DeFi;
