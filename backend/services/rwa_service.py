import requests

BASE_URL = "https://rwapipe.com/api"
TIMEOUT = 30


def consultar_api(endpoint, params=None):
    resposta = requests.get(
        f"{BASE_URL}{endpoint}",
        params=params,
        timeout=TIMEOUT
    )

    resposta.raise_for_status()
    dados = resposta.json()

    if dados.get("success") is False:
        raise RuntimeError("A API RWA Pipe retornou uma resposta sem sucesso.")

    return dados


def numero(valor):
    try:
        return float(valor or 0)
    except (ValueError, TypeError):
        return 0.0


def obter_dados_rwa():
    mercado = consultar_api(
        "/market",
        params={"excludeStablecoins": "true"}
    )

    tokens = consultar_api(
        "/tokens",
        params={
            "excludeStablecoins": "true",
            "limit": 500,
            "sortBy": "tvl",
            "order": "desc"
        }
    )

    blockchains = consultar_api(
        "/chains",
        params={"excludeStablecoins": "true"}
    )

    resumo_api = mercado.get("summary") or {}
    ativos_api = tokens.get("data") or mercado.get("data") or []
    redes_api = blockchains.get("data") or []

    ativos_validos = [
        ativo for ativo in ativos_api
        if isinstance(ativo, dict)
    ]

    redes_validas = [
        rede for rede in redes_api
        if isinstance(rede, dict)
    ]

    ativos_ordenados = sorted(
        ativos_validos,
        key=lambda ativo: numero(
            ativo.get("tvl") or ativo.get("totalTVL")
        ),
        reverse=True
    )

    redes_ordenadas = sorted(
        redes_validas,
        key=lambda rede: numero(rede.get("tvl")),
        reverse=True
    )

    return {
        "summary": {
            "total_tvl": numero(resumo_api.get("totalTVL")),
            "total_tokens": int(
                numero(resumo_api.get("totalTokens"))
            ),
            "average_apy": numero(resumo_api.get("avgApy")),
            "total_chains": int(
                numero(
                    (blockchains.get("summary") or {}).get("totalChains")
                )
            )
        },

        "assets": [
            {
                "name": ativo.get("name"),
                "symbol": ativo.get("symbol"),
                "issuer": ativo.get("issuer"),
                "category": (
                    ativo.get("category")
                    or ativo.get("type")
                ),
                "chain": ativo.get("chain"),
                "tvl": numero(
                    ativo.get("tvl") or ativo.get("totalTVL")
                ),
                "apy": (
                    numero(ativo.get("apy"))
                    if ativo.get("apy") is not None
                    else None
                ),
                "address": ativo.get("address"),
                "logo": ativo.get("logo")
            }
            for ativo in ativos_ordenados
        ],

        "chains": [
            {
                "name": rede.get("chain"),
                "tvl": numero(rede.get("tvl")),
                "token_count": int(
                    numero(rede.get("tokenCount"))
                ),
                "issuer_count": int(
                    numero(rede.get("issuers"))
                )
            }
            for rede in redes_ordenadas[:10]
        ],

        "source": "RWA Pipe"
    }
