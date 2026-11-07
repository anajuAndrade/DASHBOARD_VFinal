import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import SplashScreen from "./componentes/SplashScreen";
import Dashboard from "./paginas/Dashboard";
import Colecoes from "./paginas/Colecoes";
import DetalheNFT from "./paginas/DetalheNFT";
import Pesquisa from "./paginas/Pesquisa";
import Blockchain from "./paginas/Blockchain";
import Transacoes from "./paginas/Transacoes";
import DeFi from "./paginas/Defi";
import RWA from "./paginas/RWA";

function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true);
  return (
    <>
     {mostrarSplash && (
            <SplashScreen onFinish={setMostrarSplash.bind(null, false)} />
      )}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/colecoes" element={<Colecoes />} />
        <Route path="/nft/:id" element={<DetalheNFT />} />
        <Route path="/pesquisa" element={<Pesquisa />} />
        <Route path="/redes/:chain" element={<Blockchain />}/>
        <Route path="/ethereum" element={<Navigate to="/redes/ethereum" replace />}/>
        <Route path="/transacoes" element={<Transacoes />} />
        <Route path="/defi" element={<DeFi />} />
        <Route path="/rwa" element={<RWA />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
