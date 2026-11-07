import { NavLink } from "react-router-dom";

const linksPrincipais = [
  { to: "/", label: "⌂ Dashboard", end: true },
  { to: "/colecoes", label: "Coleções" },
  { to: "/pesquisa", label: "Pesquisar NFT" },
  { to: "/transacoes", label: "Transações" },
];

const redes = [
  { to: "/redes/bitcoin", label: "Bitcoin" },
  { to: "/redes/ethereum", label: "Ethereum" },
  { to: "/redes/solana", label: "Solana" },
  { to: "/redes/tron", label: "Tron" },
  { to: "/redes/bsc", label: "BSC" },
  { to: "/redes/polygon", label: "Polygon" },
];

const outrasCategorias = [
  { to: "/defi", label: "DEFI" },
  { to: "/rwa", label: "RWA" },
];

function Sidebar() {
  function classeLink({ isActive }) {
    return isActive ? "sidebar-link active" : "sidebar-link";
  }

  return (
    <aside className="sidebar">
      <div className="logo">
        Dashboard
        <br />
        Interativo
      </div>

      <nav>
        {linksPrincipais.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={classeLink}
          >
            {link.label}
          </NavLink>
        ))}

        <div className="menu-title">REDES</div>

        {redes.map((rede) => (
          <NavLink
            key={rede.to}
            to={rede.to}
            className={classeLink}
          >
            {rede.label}
          </NavLink>
        ))}

        <div className="menu-title">OUTROS</div>

        {outrasCategorias.map((categoria) => (
          <NavLink
            key={categoria.to}
            to={categoria.to}
            className={classeLink}
          >
            {categoria.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
