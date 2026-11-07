import { useEffect, useState } from "react";

const REDES = [
    { id: "ethereum", nome: "Ethereum" },
    { id: "solana", nome: "Solana" },
    { id: "polygon", nome: "Polygon" },
    { id: "bitcoin", nome: "Bitcoin" },
    { id: "tron", nome: "Tron" },
    { id: "bsc", nome: "BNB Smart Chain (BSC)" },
    { id: "hyperevm", nome: "HyperEVM" },
    { id: "robinhood", nome: "Robinhood" },
];

function Navbar({
    onFiltrar,
    redesSelecionadas = [],
    selecaoUnica = false,
    redesDisponiveis = REDES,
    mostrarFiltro = true,
}) {
    const [filtroAberto, setFiltroAberto] = useState(false);

    const [redesTemporarias, setRedesTemporarias] = useState(
        () => [...redesSelecionadas]
    );

    useEffect(() => {
        setRedesTemporarias((atuais) => {
            const iguais =
                atuais.length === redesSelecionadas.length &&
                atuais.every(
                    (rede, index) => rede === redesSelecionadas[index]
                );

            return iguais ? atuais : [...redesSelecionadas];
        });
    }, [redesSelecionadas]);

    useEffect(() => {
        if (!mostrarFiltro) {
            setFiltroAberto(false);
        }
    }, [mostrarFiltro]);

    function alternarRede(id) {
        setRedesTemporarias((atuais) => {
            if (selecaoUnica) {
                return [id];
            }

            return atuais.includes(id)
                ? atuais.filter((rede) => rede !== id)
                : [...atuais, id];
        });
    }

    function concluirFiltro() {
        onFiltrar?.(redesTemporarias);
        setFiltroAberto(false);
    }

    function limparFiltros() {
        setRedesTemporarias([]);
        onFiltrar?.([]);
        setFiltroAberto(false);
    }

    return (
        <header className="navbar">
            {mostrarFiltro && (
                <div className="navbar-filter-wrapper">
                    <button
                        type="button"
                        className="filtro"
                        onClick={() => setFiltroAberto((aberto) => !aberto)}
                        aria-expanded={filtroAberto}
                    >
                        Filtro ▾
                    </button>

                    {filtroAberto && (
                        <div className="navbar-filter-menu">
                            <div className="navbar-filter-heading">
                                <strong>Filtrar por rede</strong>

                                <button
                                    type="button"
                                    className="navbar-filter-clear"
                                    onClick={limparFiltros}
                                >
                                    Limpar
                                </button>
                            </div>

                            <p>
                                {selecaoUnica
                                    ? "Selecione uma rede."
                                    : "Selecione uma ou mais redes."}
                            </p>

                            <div className="navbar-filter-options">
                                {redesDisponiveis.map((rede) => (
                                    <label
                                        key={rede.id}
                                        className="navbar-filter-option"
                                    >
                                        <input
                                            type={selecaoUnica ? "radio" : "checkbox"}
                                            name={
                                                selecaoUnica
                                                    ? "rede-dashboard"
                                                    : undefined
                                            }
                                            checked={redesTemporarias.includes(rede.id)}
                                            onChange={() => alternarRede(rede.id)}
                                        />

                                        <span>{rede.nome}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="navbar-filter-apply"
                                onClick={concluirFiltro}
                            >
                                Concluir
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

export default Navbar;
