
import { useEffect, useMemo, useState } from "react";
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

function formatarNumero(valor) {
    return Number(valor || 0).toLocaleString("pt-BR");
}

function formatarAPY(valor) {
    if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
        return "Não informado";
    }

    return `${Number(valor).toFixed(2)}%`;
}

function formatarNome(valor) {
    if (!valor) return "Não informado";

    return valor
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function RWA() {
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [pesquisa, setPesquisa] = useState("");
    const [categoria, setCategoria] = useState("todas");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await api.get("/rwa/dashboard");

                if (ativo) {
                    setDados(resposta.data);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.response?.data?.error ||
                        "Não foi possível carregar os dados RWA."
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

    const ativos = dados?.assets || [];
    const redes = dados?.chains || [];
    const resumo = dados?.summary || {};

    const categorias = useMemo(() => {
        return [...new Set(
            ativos.map((ativo) => ativo.category).filter(Boolean)
        )].sort();
    }, [ativos]);

    const normalizarTexto = (valor) => {
        return String(valor ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    };

    const ativosFiltrados = useMemo(() => {
        const ativos = dados?.assets ?? [];
        const termo = normalizarTexto(pesquisa);
        const categoriaSelecionada = normalizarTexto(categoria);

        return ativos.filter((ativo) => {
            const correspondePesquisa =
                !termo ||
                [
                    ativo.name,
                    ativo.symbol,
                    ativo.issuer,
                    ativo.category,
                    ativo.type,
                    ativo.chain,
                    ativo.address
                ].some((campo) =>
                    normalizarTexto(campo).includes(termo)
                );

            const correspondeCategoria =
                !categoriaSelecionada ||
                categoriaSelecionada === "todas" ||
                normalizarTexto(ativo.category || ativo.type) ===
                categoriaSelecionada;

            return correspondePesquisa && correspondeCategoria;
        });
    }, [dados, pesquisa, categoria]);


    const maiorTvl = Math.max(
        ...redes.map((rede) => Number(rede.tvl || 0)),
        1
    );

    return (
        <div className="app">
            <Sidebar />

            <div className="main-content">
                <Navbar mostrarFiltro={false} />

                <main className="defi-page rwa-page">
                    <div className="defi-header">
                        <div>
                            <h1>Real World Assets (RWA)</h1>
                            <p>
                                Acompanhe ativos do mundo real representados
                                por tokens em redes blockchain.
                            </p>
                        </div>

                        <span className="defi-source">
                            Dados: {dados?.source || "RWA Pipe"}
                        </span>
                    </div>

                    {carregando && (
                        <p className="defi-message">
                            Carregando indicadores do mercado RWA...
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
                                    <span>TVL total do mercado</span>
                                    <strong>
                                        {formatarDolar(resumo.total_tvl)}
                                    </strong>
                                    <small>Valor total bloqueado em ativos RWA</small>
                                </article>

                                <article className="defi-metric-card">
                                    <span>Tokens acompanhados</span>
                                    <strong>
                                        {formatarNumero(resumo.total_tokens)}
                                    </strong>
                                    <small>Ativos registrados na plataforma</small>
                                </article>

                                <article className="defi-metric-card">
                                    <span>APY médio</span>
                                    <strong>
                                        {formatarAPY(resumo.average_apy)}
                                    </strong>
                                    <small>Rendimento percentual anual médio informado</small>
                                </article>

                                <article className="defi-metric-card">
                                    <span>Blockchains</span>
                                    <strong>
                                        {formatarNumero(resumo.total_chains)}
                                    </strong>
                                    <small>Redes com ativos RWA</small>
                                </article>
                            </section>

                            <section className="defi-section">
                                <div className="defi-section-header">
                                    <div>
                                        <h2>Distribuição por blockchain</h2>
                                        <p>
                                            Redes com maior valor total de ativos
                                            do mundo real tokenizados.
                                        </p>
                                    </div>
                                </div>

                                <div className="defi-chain-list">
                                    {redes.map((rede, indice) => (
                                        <div
                                            className="defi-chain-item"
                                            key={rede.name}
                                        >
                                            <div className="defi-chain-number">
                                                {indice + 1}
                                            </div>

                                            <div className="defi-chain-info">
                                                <strong>
                                                    {formatarNome(rede.name)}
                                                </strong>

                                                <div className="defi-chain-progress">
                                                    <div
                                                        style={{
                                                            width: `${(Number(rede.tvl || 0) / maiorTvl) * 100}%`,
                                                        }}
                                                    />
                                                </div>

                                                <small className="rwa-chain-details">
                                                    {formatarNumero(rede.token_count)} tokens
                                                    {" · "}
                                                    {formatarNumero(rede.issuer_count)} emissores
                                                </small>
                                            </div>

                                            <strong>
                                                {formatarDolar(rede.tvl)}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <p className="defi-chart-caption">
                                    Valores em dólares americanos (USD).
                                </p>
                            </section>

                            <section className="defi-section">
                                <div className="defi-section-header">
                                    <div>
                                        <h2>Principais ativos RWA</h2>
                                        <p>
                                            Explore os tokens, emissores,
                                            categorias e redes disponíveis.
                                        </p>
                                    </div>

                                    <span className="defi-chart-period">
                                        {ativosFiltrados.length} ativos
                                    </span>
                                </div>

                                <div className="rwa-toolbar">
                                    <input
                                        type="text"
                                        placeholder="Pesquisar por nome, símbolo, emissor ou rede..."
                                        value={pesquisa}
                                        onChange={(e) => setPesquisa(e.target.value)}
                                    />

                                    <select
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                    >
                                        <option value="todas">
                                            Todas as categorias
                                        </option>

                                        {categorias.map((item) => (
                                            <option key={item} value={item}>
                                                {formatarNome(item)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="defi-table-wrapper">
                                    <table className="defi-table rwa-table">
                                        <thead>
                                            <tr>
                                                <th>Ativo</th>
                                                <th>Emissor</th>
                                                <th>Categoria</th>
                                                <th>Blockchain</th>
                                                <th>APY</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {ativosFiltrados.map((ativo, indice) => (
                                                <tr
                                                    key={`${ativo.address}-${indice}`}
                                                >
                                                    <td>
                                                        <div className="defi-protocol">
                                                            <div className="rwa-token-icon">
                                                                {(ativo.symbol || "R").slice(0, 2)}
                                                            </div>

                                                            <div>
                                                                <strong>{ativo.name}</strong>
                                                                <small>{ativo.symbol}</small>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>{ativo.issuer || "—"}</td>

                                                    <td>
                                                        <span className="rwa-category">
                                                            {formatarNome(ativo.category)}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatarNome(ativo.chain)}
                                                    </td>

                                                    <td className="rwa-apy">
                                                        {formatarAPY(ativo.apy)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {ativosFiltrados.length === 0 && (
                                        <p className="defi-message">
                                            Nenhum ativo encontrado para os filtros selecionados.
                                        </p>
                                    )}
                                </div>
                            </section>

                            <section className="blockchain-info">
                                <h2>Sobre RWA</h2>

                                <div className="blockchain-info-content">
                                    <div>
                                        <h3>O que são RWA?</h3>
                                        <p>
                                            RWA (Real-World Assets), ou Ativos do Mundo Real, são ativos
                                            físicos ou financeiros representados digitalmente por meio
                                            de tokens em uma blockchain. Essa tecnologia permite
                                            conectar ativos tradicionais ao ambiente digital, criando
                                            novas possibilidades de negociação e gerenciamento.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Como funciona a tokenização?</h3>
                                        <p>
                                            A tokenização consiste em representar a propriedade ou
                                            determinados direitos sobre um ativo por meio de tokens
                                            digitais registrados em uma blockchain. Esses tokens podem
                                            representar frações de um ativo, permitindo que diferentes
                                            participantes tenham acesso a uma parcela de seu valor ou
                                            rendimento, conforme as condições estabelecidas.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Exemplos de ativos tokenizados</h3>
                                        <p>
                                            Diversos tipos de ativos podem ser tokenizados, como imóveis,
                                            títulos de dívida, ações, commodities, obras de arte e
                                            instrumentos financeiros. A representação digital desses
                                            ativos busca facilitar sua negociação e ampliar as
                                            possibilidades de acesso ao mercado.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Benefícios e aplicações</h3>
                                        <p>
                                            A tokenização pode proporcionar maior transparência,
                                            rastreabilidade, possibilidade de fracionamento e
                                            automatização de processos por meio de contratos
                                            inteligentes. Também pode facilitar a transferência de
                                            ativos e ampliar o acesso a determinados investimentos.
                                        </p>
                                    </div>

                                    <div>
                                        <h3>Riscos e desafios</h3>
                                        <p>
                                            O mercado de RWA ainda enfrenta desafios relacionados à
                                            regulamentação, à comprovação da existência e da propriedade
                                            dos ativos, à segurança das plataformas e à integração entre
                                            sistemas tradicionais e redes blockchain. A validade dos
                                            direitos associados aos tokens também depende das condições
                                            jurídicas e contratuais de cada ativo.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <p className="defi-disclaimer">
                                Fonte: RWA Pipe. Os dados são provenientes de
                                informações públicas sobre ativos tokenizados.
                                Valores individuais de TVL e APY podem não estar
                                disponíveis para todos os ativos. Os indicadores
                                podem variar conforme a atualização da API.
                            </p>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default RWA;
