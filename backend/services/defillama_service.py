
import requests

BASE_URL = "https://api.llama.fi"
TIMEOUT = 30


def consultar_api(endpoint):
    resposta = requests.get(
        f"{BASE_URL}{endpoint}",
        timeout=TIMEOUT
    )

    resposta.raise_for_status()
    return resposta.json()


def numero(valor):
    try:
        return float(valor or 0)
    except (ValueError, TypeError):
        return 0.0


def obter_dados_defi():

    protocolos_api = consultar_api("/protocols")
    blockchains_api = consultar_api("/v2/chains")

    dex_api = consultar_api(
        "/overview/dexs?excludeTotalDataChart=true"
    )

    taxas_api = consultar_api(
        "/overview/fees?excludeTotalDataChart=true"
    )

    historico_api = consultar_api("/v2/historicalChainTvl")

    protocolos_validos = [
        protocolo for protocolo in protocolos_api
        if isinstance(protocolo, dict)
    ]

    protocolos_ordenados = sorted(
        protocolos_validos,
        key=lambda protocolo: numero(protocolo.get("tvl")),
        reverse=True
    )

    blockchains_validas = [
        blockchain for blockchain in blockchains_api
        if isinstance(blockchain, dict)
    ]

    blockchains_ordenadas = sorted(
        blockchains_validas,
        key=lambda blockchain: numero(blockchain.get("tvl")),
        reverse=True
    )

    historico_ordenado = sorted(
        [
            registro for registro in historico_api
            if isinstance(registro, dict)
        ],
        key=lambda registro: registro.get("date", 0)
    )

    historico = [
        {
            "date": registro.get("date"),
            "tvl": numero(registro.get("tvl"))
        }
        for registro in historico_ordenado[-30:]
    ]

    protocolos = [
        {
            "id": protocolo.get("slug") or protocolo.get("name"),
            "name": protocolo.get("name"),
            "logo": protocolo.get("logo"),
            "category": protocolo.get("category"),
            "tvl": numero(protocolo.get("tvl")),
            "change_1d": protocolo.get("change_1d")
        }
        for protocolo in protocolos_ordenados[:10]
    ]


    chains = [
        {
            "name": blockchain.get("name"),
            "tvl": numero(blockchain.get("tvl"))
        }
        for blockchain in blockchains_ordenadas[:10]
    ]

    return {
        "summary": {
            "total_tvl": sum(
                numero(protocolo.get("tvl"))
                for protocolo in protocolos_validos
            ),
            "protocols_count": len(protocolos_validos),
            "dex_volume_24h": numero(
                dex_api.get("total24h")
            ),
            "fees_24h": numero(
                taxas_api.get("total24h")
            )
        },
        "protocols": protocolos,
        "chains": chains,
        "history": historico,
        "source": "DeFiLlama"
    }
