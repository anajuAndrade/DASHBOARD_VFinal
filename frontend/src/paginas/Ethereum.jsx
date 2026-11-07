import Sidebar from "../componentes/Sidebar";
import Navbar from "../componentes/Navbar";
import MetricCard from "../componentes/MetricCard";
import MarketChart from "../componentes/MarketChart";

function Ethereum() {

  const dadosEthereum = {
    rede: "Ethereum",

    nftsNegociadas: "18.742",

    volume24h: "2.847,63 ETH",

    floorPrice: "7,90 ETH",

    transacoes24h: "5.381",

    colecoes: [
      {
        nome: "Bored Ape Yacht Club",
        floor: "7,90 ETH",
        volume: "684,21 ETH"
      },
      {
        nome: "CryptoPunks",
        floor: "39,80 ETH",
        volume: "521,74 ETH"
      },
      {
        nome: "Pudgy Penguins",
        floor: "8,42 ETH",
        volume: "413,28 ETH"
      },
      {
        nome: "Azuki",
        floor: "3,21 ETH",
        volume: "287,91 ETH"
      }
    ],

    transacoes: [
      {
        nft: "BAYC #3826",
        valor: "7,49 ETH",
        marketplace: "Blur"
      },
      {
        nft: "CryptoPunk #7804",
        valor: "41,20 ETH",
        marketplace: "OpenSea"
      },
      {
        nft: "Pudgy Penguin #8256",
        valor: "8,15 ETH",
        marketplace: "OpenSea"
      },
      {
        nft: "Azuki #5005",
        valor: "3,40 ETH",
        marketplace: "Blur"
      }
    ]
  };


  return (

    <div className="app">

      <Sidebar />

      <main className="main-content">

        <Navbar mostrarFiltro={false} />

        <section className="dashboard-content">


          <div className="network-header">

            <h1>Ethereum</h1>

            <p>
              Dados e atividade de NFTs na rede Ethereum
            </p>

            <span className="network-status">
              ● Rede ativa
            </span>

          </div>

          <div className="metrics">

            <MetricCard
              titulo="NFTs negociadas"
              valor={dadosEthereum.nftsNegociadas}
            />

            <MetricCard
              titulo="Volume 24h"
              valor={dadosEthereum.volume24h}
            />

            <MetricCard
              titulo="Floor Price médio"
              valor={dadosEthereum.floorPrice}
            />

            <MetricCard
              titulo="Transações 24h"
              valor={dadosEthereum.transacoes24h}
            />

          </div>


          <section className="market-section">


            <div className="chart-container">

              <h2>Análise de mercado</h2>

              <p className="chart-subtitle">
                Volume de negociação de NFTs na Ethereum
              </p>

              <MarketChart />

            </div>


            <div className="top-collections">

              <h2>Top coleções</h2>

              <div className="collections-list">

                {dadosEthereum.colecoes.map((colecao, index) => (

                  <div
                    className="collection-item"
                    key={index}
                  >

                    <div className="collection-info">

                      <strong>
                        {colecao.nome}
                      </strong>

                      <span>
                        Floor: {colecao.floor}
                      </span>

                    </div>

                    <span className="collection-volume">
                      {colecao.volume}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </section>

          <section className="bottom-section">

            <div className="featured">

              <h2>Rede Ethereum</h2>

              <div className="network-info">

                <p>
                  <span>Blockchain</span>
                  Ethereum
                </p>

                <p>
                  <span>Status</span>
                  Ativa
                </p>

                <p>
                  <span>Ativos analisados</span>
                  NFTs
                </p>

                <p>
                  <span>Período</span>
                  Últimas 24 horas
                </p>

              </div>

            </div>


            <div className="transactions">

              <h2>Transações recentes</h2>

              <div className="transactions-list">

                {dadosEthereum.transacoes.map(
                  (transacao, index) => (

                    <div
                      className="transaction-item"
                      key={index}
                    >

                      <div className="transaction-info">

                        <strong>
                          {transacao.nft}
                        </strong>

                        <small>
                          {transacao.marketplace}
                        </small>

                      </div>

                      <span>
                        {transacao.valor}
                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Ethereum;