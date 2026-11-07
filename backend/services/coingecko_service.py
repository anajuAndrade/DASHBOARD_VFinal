
import os
import requests
from functools import lru_cache

BASE_URL = "https://api.coingecko.com/api/v3"

HEADERS = {
    "x-cg-demo-api-key": os.getenv("COINGECKO_API_KEY", "")
}

REDES_COINGECKO = {
    "bsc": "binance-smart-chain",
    "bitcoin": "ordinals"
}


def consultar_api(endpoint, params=None):
    if not HEADERS["x-cg-demo-api-key"]:
        raise ValueError("COINGECKO_API_KEY não foi encontrada no ambiente.")

    response = requests.get(
        f"{BASE_URL}{endpoint}",
        headers=HEADERS,
        params=params,
        timeout=30
    )

    response.raise_for_status()
    return response.json()


@lru_cache(maxsize=8)
def listar_colecoes_rede(rede):
    plataforma = REDES_COINGECKO.get(rede)

    if not plataforma:
        return []

    colecoes = []

    for pagina in range(1, 11):
        resultado = consultar_api(
            "/nfts/list",
            {
                "per_page": 250,
                "page": pagina
            }
        )

        encontradas = [
            item for item in resultado
            if item.get("asset_platform_id") == plataforma
        ]

        colecoes.extend(encontradas)

        if len(resultado) < 250:
            break

    return colecoes


def obter_detalhes_colecao(colecao):
    dados = consultar_api(f"/nfts/{colecao['id']}")

    floor = dados.get("floor_price") or {}
    volume = dados.get("volume_24h") or {}

    imagem = dados.get("image") or {}

    return {
        "slug": dados.get("id"),
        "name": dados.get("name") or colecao.get("name"),
        "chain": colecao.get("asset_platform_id"),
        "image_url": imagem.get("small_2x") or imagem.get("small"),
        "description": dados.get("description"),
        "opensea_url": (
            f"https://www.coingecko.com/en/nft/{dados.get('web_slug')}"
        ),
        "floor_price": floor.get("native_currency"),
        "floor_price_symbol": dados.get("native_currency_symbol"),
        "floor_price_usd": floor.get("usd"),
        "volume_24h": volume.get("native_currency"),
        "volume_24h_symbol": dados.get("native_currency_symbol"),
        "volume_24h_usd": volume.get("usd"),
        "sales_24h": dados.get("one_day_sales"),
        "total_sales": None,
        "market_cap": (dados.get("market_cap") or {}).get("usd"),
        "source": "CoinGecko"
    }


def obter_colecoes_rede(rede):
    colecoes = listar_colecoes_rede(rede)
    resultado = []

    for colecao in colecoes[:10]:
        try:
            resultado.append(obter_detalhes_colecao(colecao))
        except requests.exceptions.RequestException as erro:
            print(
                f"Erro ao consultar coleção {colecao.get('id')}: {erro}"
            )

    return resultado
