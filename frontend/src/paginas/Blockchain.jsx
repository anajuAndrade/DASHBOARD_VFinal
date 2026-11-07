
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import api from "../service/api";

const REDES = {
    bitcoin: { nome: "Bitcoin", id: "bitcoin" },
    ethereum: { nome: "Ethereum", id: "ethereum" },
    solana: { nome: "Solana", id: "solana" },
    tron: { nome: "Tron", id: "tron" },
    bsc: { nome: "BNB Smart Chain", id: "bsc" },
    polygon: { nome: "Polygon", id: "polygon" },
};


const INFORMACOES_REDES = {
    bitcoin: {
        titulo: "O que é Bitcoin?",
        descricao:
            "O Bitcoin é uma moeda digital criada em 2009 que permite realizar transações diretamente entre pessoas, sem depender de bancos ou de uma instituição central. Sua rede funciona de forma descentralizada, com registros públicos das transações.",
        funcionamento: [
            {
                titulo: "Rede descentralizada",
                texto: "As transações são verificadas por participantes distribuídos pelo mundo, sem depender de uma autoridade central."
            },
            {
                titulo: "Mineração",
                texto: "Os mineradores utilizam poder computacional para validar blocos de transações e contribuir para a segurança da rede."
            },
            {
                titulo: "Segurança e transparência",
                texto: "As transações são registradas em uma blockchain pública, permitindo consultar o histórico de movimentações."
            }
        ],
        nftTitulo: "Bitcoin e os NFTs",
        nftDescricao:
            "Embora o Bitcoin tenha sido criado principalmente como uma moeda digital, o protocolo Ordinals possibilitou registrar conteúdos digitais associados a satoshis, a menor unidade do Bitcoin. Esses registros são conhecidos como inscrições Ordinals e permitem a criação e negociação de ativos digitais semelhantes aos NFTs."
    },

    ethereum: {
        titulo: "O que é Ethereum?",
        descricao:
            "Ethereum é uma plataforma blockchain que permite muito mais do que transferências de criptomoedas. Ela possibilita a criação de aplicações descentralizadas e contratos inteligentes, que executam regras automaticamente na rede.",
        funcionamento: [
            {
                titulo: "Contratos inteligentes",
                texto: "São programas armazenados na blockchain que executam determinadas ações quando as condições estabelecidas são atendidas."
            },
            {
                titulo: "Aplicações descentralizadas",
                texto: "Permite desenvolver serviços digitais que funcionam por meio da blockchain, sem depender de uma única entidade central."
            },
            {
                titulo: "Ether (ETH)",
                texto: "É a criptomoeda nativa da rede, utilizada para realizar operações e pagar as taxas de transação."
            }
        ],
        nftTitulo: "Ethereum e os NFTs",
        nftDescricao:
            "Ethereum é uma das principais redes utilizadas no mercado de NFTs. Padrões como ERC-721 e ERC-1155 permitem criar e gerenciar ativos digitais únicos ou coleções de itens digitais."
    },

    solana: {
        titulo: "O que é Solana?",
        descricao:
            "Solana é uma plataforma blockchain desenvolvida para oferecer transações rápidas e custos relativamente baixos. Ela permite criar aplicações descentralizadas, serviços financeiros e diferentes tipos de ativos digitais.",
        funcionamento: [
            {
                titulo: "Alta velocidade",
                texto: "A rede foi projetada para processar um grande volume de operações em pouco tempo."
            },
            {
                titulo: "Baixos custos",
                texto: "Suas taxas de transação costumam ser reduzidas, facilitando a realização de operações frequentes."
            },
            {
                titulo: "Ecossistema de aplicações",
                texto: "Possibilita o desenvolvimento de aplicações, jogos, serviços financeiros e plataformas de ativos digitais."
            }
        ],
        nftTitulo: "Solana e os NFTs",
        nftDescricao:
            "A rede permite criar, armazenar e negociar NFTs. Seu ecossistema conta com coleções digitais, jogos e marketplaces que utilizam a infraestrutura da Solana."
    },

    tron: {
        titulo: "O que é TRON?",
        descricao:
            "TRON é uma plataforma blockchain criada para facilitar a transferência de ativos digitais e o desenvolvimento de aplicações descentralizadas. Sua criptomoeda nativa é o TRX.",
        funcionamento: [
            {
                titulo: "Transferências digitais",
                texto: "A rede permite movimentar ativos digitais entre carteiras, com registros públicos das operações."
            },
            {
                titulo: "Aplicações descentralizadas",
                texto: "Oferece suporte à criação de aplicações e contratos inteligentes."
            },
            {
                titulo: "Ecossistema TRON",
                texto: "Possui diferentes padrões de tokens, utilizados para representar moedas e outros ativos digitais."
            }
        ],
        nftTitulo: "TRON e os NFTs",
        nftDescricao:
            "A TRON permite a criação de NFTs por meio do padrão TRC-721. Esses ativos podem representar itens digitais únicos, colecionáveis e outros conteúdos registrados na blockchain."
    },

    bsc: {
        titulo: "O que é BNB Smart Chain?",
        descricao:
            "A BNB Smart Chain é uma rede blockchain que faz parte do ecossistema BNB. Ela permite executar contratos inteligentes e desenvolver aplicações descentralizadas, incluindo serviços financeiros e plataformas de ativos digitais.",
        funcionamento: [
            {
                titulo: "Compatibilidade com Ethereum",
                texto: "A rede é compatível com a Máquina Virtual Ethereum (EVM), facilitando a utilização de ferramentas e aplicações desse ecossistema."
            },
            {
                titulo: "Taxas de transação",
                texto: "As operações utilizam BNB para o pagamento de taxas da rede."
            },
            {
                titulo: "Aplicações descentralizadas",
                texto: "Oferece infraestrutura para contratos inteligentes, serviços financeiros e diferentes projetos digitais."
            }
        ],
        nftTitulo: "BNB Smart Chain e os NFTs",
        nftDescricao:
            "A rede permite criar e negociar NFTs utilizando padrões como o BEP-721. Esses padrões possibilitam representar itens digitais únicos e colecionáveis."
    },

    polygon: {
        titulo: "O que é Polygon?",
        descricao:
            "Polygon é um ecossistema de tecnologias blockchain associado ao Ethereum. Suas soluções buscam ampliar a capacidade de processamento e oferecer alternativas para aplicações que precisam de transações mais acessíveis.",
        funcionamento: [
            {
                titulo: "Escalabilidade",
                texto: "Suas tecnologias buscam permitir que aplicações blockchain atendam a mais usuários e operações."
            },
            {
                titulo: "Ecossistema Ethereum",
                texto: "A Polygon mantém integração com ferramentas e aplicações desenvolvidas para o ecossistema Ethereum."
            },
            {
                titulo: "Aplicações digitais",
                texto: "É utilizada em projetos de finanças descentralizadas, jogos, identidade digital e outros serviços."
            }
        ],
        nftTitulo: "Polygon e os NFTs",
        nftDescricao:
            "A Polygon é utilizada para criar e negociar NFTs, oferecendo uma alternativa para projetos que desejam aproveitar ferramentas compatíveis com Ethereum e buscar custos de operação menores."
    }
};


function numero(valor, casas = 2) {
    if (valor === null || valor === undefined || valor === "") {
        return "—";
    }

    const n = Number(valor);

    return Number.isFinite(n)
        ? n.toLocaleString("pt-BR", { maximumFractionDigits: casas })
        : "—";
}

function Blockchain() {
    const { chain } = useParams();
    const rede = REDES[(chain || "").toLowerCase()];
    const isTron = rede?.id === "tron";
    const informacoes = INFORMACOES_REDES[rede?.id];
    const [colecoes, setColecoes] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro("");
            setColecoes([]);

            const redeAtual = REDES[(chain || "").toLowerCase()];

            if (!redeAtual) {
                setErro("A rede solicitada não foi reconhecida.");
                setCarregando(false);
                return;
            }

            try {
                const response = await api.get("/collections", {
                    params: { chain: redeAtual.id },
                });

                if (ativo) {
                    setColecoes(response.data.collections || []);
                }
            } catch (error) {
                console.error("Erro ao carregar dados da rede:", error);

                if (ativo) {
                    setErro(
                        error.response?.data?.error ||
                        `Não foi possível carregar os dados de ${redeAtual.nome}.`
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [chain]);

    const colecoesFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();

        if (!termo) return colecoes;

        return colecoes.filter((item) =>
            `${item.name || ""} ${item.slug || ""}`
                .toLowerCase()
                .includes(termo)
        );
    }, [colecoes, busca]);

    const totalVendas24h = colecoes.reduce(
        (soma, item) => soma + (Number(item.sales_24h) || 0),
        0
    );

    const vendasTotaisDisponiveis = colecoes.some(
        (item) => item.total_sales !== null &&
            item.total_sales !== undefined
    );

    const totalVendas = vendasTotaisDisponiveis
        ? colecoes.reduce(
            (soma, item) => soma + (Number(item.total_sales) || 0),
            0
        )
        : null;

    const totalTransferenciasDia = colecoes.reduce(
        (soma, item) =>
            soma + (Number(item.daily_transfer_count) || 0),
        0
    );

    const totalTransferencias = colecoes.some(
        (item) => item.total_sales !== null &&
            item.total_sales !== undefined
    )
        ? colecoes.reduce(
            (soma, item) =>
                soma + (Number(item.total_sales) || 0),
            0
        )
        : null;

    return (
        <div className="app">
            <Sidebar />

            <main className="main-content">
                <Navbar onBuscar={setBusca} mostrarFiltro={false} />

                <section className="dashboard-content collections-page">
                    <header className="collections-header">
                        <div>
                            <span className="collections-eyebrow">
                                VISÃO POR BLOCKCHAIN
                            </span>

                            <h1>{rede?.nome || "Rede não encontrada"}</h1>

                            <p>
                                Acompanhe as coleções NFT disponíveis nesta rede
                                e seus indicadores fornecidos pela{" "}
                                {isTron ? "TRONSCAN" : "OpenSea"}.
                            </p>
                        </div>
                    </header>

                    {!erro && (
                        <div className="metrics blockchain-metrics">

                            {isTron ? (
                                <>
                                    <article className="metric-card">
                                        <h3>Transferências no dia</h3>
                                        <p>
                                            {carregando
                                                ? "..."
                                                : numero(totalTransferenciasDia, 0)}
                                        </p>
                                    </article>

                                    <article className="metric-card">
                                        <h3>Transferências totais</h3>
                                        <p>
                                            {carregando
                                                ? "..."
                                                : numero(totalTransferencias, 0)}
                                        </p>
                                    </article>
                                </>
                            ) : (
                                <>
                                    <article className="metric-card">
                                        <h3>Vendas em 24h</h3>
                                        <p>
                                            {carregando
                                                ? "..."
                                                : numero(totalVendas24h, 0)}
                                        </p>
                                    </article>

                                    <article className="metric-card">
                                        <h3>Vendas totais registradas</h3>
                                        <p>
                                            {carregando
                                                ? "..."
                                                : totalVendas === null
                                                    ? "—"
                                                    : numero(totalVendas, 0)}
                                        </p>
                                    </article>
                                </>
                            )}
                        </div>
                    )}

                    <div className="collections-toolbar">
                        <div className="collection-search">
                            <span aria-hidden="true">⌕</span>
                            <input
                                type="search"
                                placeholder="Buscar coleção nesta rede..."
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                                aria-label="Buscar coleção nesta rede"
                            />
                        </div>
                    </div>

                    {carregando && (
                        <div className="collections-message">
                            <div className="collections-loader" />
                            <p>Carregando dados da rede...</p>
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

                    {!carregando && !erro && colecoesFiltradas.length === 0 && (
                        <div className="collections-message">
                            <p>
                                Não foram encontradas coleções para esta rede ou busca.
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
                                                alt={`Imagem de ${colecao.name}`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="collection-image-placeholder">
                                                NFT
                                            </div>
                                        )}

                                        <span className="collection-network">
                                            {rede?.nome}
                                        </span>
                                    </div>

                                    <div className="collection-card-content">
                                        <h2 title={colecao.name}>
                                            {colecao.name}
                                        </h2>

                                        <p className="collection-description">
                                            {colecao.description?.trim() ||
                                                "Sem descrição disponível para esta coleção."}
                                        </p>

                                        <div className="collection-stats-grid">
                                            <div className="collection-stat-box">
                                                <span>Preço mínimo</span>
                                                <strong>
                                                    {numero(colecao.floor_price, 4)}
                                                </strong>
                                                <small>
                                                    {colecao.floor_price_symbol || "—"}
                                                </small>
                                            </div>

                                            <div className="collection-stat-box">
                                                <span>
                                                    {isTron
                                                        ? "Volume em 24h"
                                                        : "Volume em 24h"}
                                                </span>
                                                <strong>
                                                    {numero(colecao.volume_24h, 3)}
                                                </strong>
                                                <small>
                                                    {colecao.volume_24h_symbol || "—"}
                                                </small>

                                                {isTron &&
                                                    colecao.volume_24h_usd != null && (
                                                        <small>
                                                            US$ {numero(
                                                                colecao.volume_24h_usd
                                                            )}
                                                        </small>
                                                    )}
                                            </div>

                                            {isTron ? (
                                                <>
                                                    <div className="collection-stat-box">
                                                        <span>
                                                            Transferências no dia
                                                        </span>
                                                        <strong>
                                                            {numero(
                                                                colecao.daily_transfer_count,
                                                                0
                                                            )}
                                                        </strong>
                                                        <small>
                                                            {colecao.daily_transfer_day ||
                                                                "Dados indisponíveis"}
                                                        </small>
                                                    </div>

                                                    <div className="collection-stat-box">
                                                        <span>
                                                            Transferências totais
                                                        </span>
                                                        <strong>
                                                            {numero(
                                                                colecao.total_sales,
                                                                0
                                                            )}
                                                        </strong>
                                                        <small>registradas na rede</small>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="collection-stat-box">
                                                        <span>Vendas em 24h</span>
                                                        <strong>
                                                            {numero(
                                                                colecao.sales_24h,
                                                                0
                                                            )}
                                                        </strong>
                                                        <small>transações</small>
                                                    </div>

                                                    <div className="collection-stat-box">
                                                        <span>Vendas totais</span>
                                                        <strong>
                                                            {numero(
                                                                colecao.total_sales,
                                                                0
                                                            )}
                                                        </strong>
                                                        <small>registradas</small>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {isTron && (
                                            <div className="collection-stat-box">
                                                <span>
                                                    Quantidade transferida no dia
                                                </span>
                                                <strong>
                                                    {numero(
                                                        colecao.daily_transfer_amount,
                                                        4
                                                    )}{" "}
                                                    {colecao.daily_transfer_symbol || ""}
                                                </strong>

                                                {colecao.daily_transfer_amount_usd != null && (
                                                    <small>
                                                        US$ {numero(
                                                            colecao.daily_transfer_amount_usd
                                                        )}
                                                    </small>
                                                )}
                                            </div>
                                        )}

                                        {colecao.opensea_url ? (
                                            <a
                                                className="collection-link"
                                                href={colecao.opensea_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Explorar coleção
                                                <span aria-hidden="true">↗</span>
                                            </a>
                                        ) : isTron ? (
                                            <div className="contract-address">
                                                <span>Endereço do contrato</span>
                                                <code>{colecao.contract_address || "Não disponível"}</code>
                                            </div>
                                        ) : (
                                            <a
                                                className="collection-link"
                                                href={`https://opensea.io/collection/${colecao.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Explorar coleção
                                                <span aria-hidden="true">↗</span>
                                            </a>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    {informacoes && (
                        <section className="blockchain-info">
                            <div className="blockchain-info-intro">
                                <span className="collections-eyebrow">
                                    CONHEÇA A BLOCKCHAIN
                                </span>

                                <h2>{informacoes.titulo}</h2>
                                <p>{informacoes.descricao}</p>
                            </div>

                            <div className="blockchain-info-grid">
                                {informacoes.funcionamento.map((item, index) => (
                                    <article
                                        className="blockchain-info-card"
                                        key={item.titulo}
                                    >
                                        <span className="blockchain-info-number">
                                            0{index + 1}
                                        </span>

                                        <h3>{item.titulo}</h3>
                                        <p>{item.texto}</p>
                                    </article>
                                ))}
                            </div>

                            <div className="blockchain-nft-info">
                                <div>
                                    <span className="collections-eyebrow">
                                        MERCADO DE ATIVOS DIGITAIS
                                    </span>

                                    <h3>{informacoes.nftTitulo}</h3>
                                    <p>{informacoes.nftDescricao}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Blockchain;
