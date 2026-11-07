import os
import requests
from functools import lru_cache

BASE_URL = "https://apilist.tronscanapi.com/api"

HEADERS = {
    "TRON-PRO-API-KEY": os.getenv("TRONSCAN_API_KEY", "")
}


def consultar_api(endpoint, params=None):
    if not HEADERS["TRON-PRO-API-KEY"]:
        raise ValueError("TRONSCAN_API_KEY não foi encontrada no ambiente.")

    url = f"{BASE_URL}{endpoint}"

    response = requests.get(
        url,
        headers=HEADERS,
        params=params,
        timeout=30
    )


    response.raise_for_status()
    return response.json()


@lru_cache(maxsize=4)
def listar_colecoes_tron():
    resultado = consultar_api(
        "/tokens/overview",
        {
            "start": 0,
            "limit": 20,
            "order": "desc",
            "filter": "trc721",
            "sort": "volume24hInTrx",
            "showAll": 0
        }
    )

    tokens = resultado.get("tokens", [])

    colecoes = [
        token for token in tokens
        if token.get("name")
        and int(token.get("transferCount") or 0) > 0
    ]

    return colecoes



def obter_colecoes_tron():
    colecoes = listar_colecoes_tron()    
    resultado = []

    for colecao in colecoes:
        resultado.append({
            "slug": colecao.get("contractAddress"),
            "name": colecao.get("name"),
            "chain": "tron",
            "image_url": colecao.get("imgUrl"),
            "description": colecao.get("description"),
            "opensea_url": None,
            "contract_address": colecao.get("contractAddress"),
            "floor_price": None,
            "floor_price_symbol": "TRX",
            "floor_price_usd": None,
            "volume_24h": None,
            "volume_24h_symbol": "TRX",
            "volume_24h_usd": None,
            "sales_24h": colecao.get("recentTransferCount"),
            "total_sales": colecao.get("transferCount"),
            "holders": colecao.get("nrOfTokenHolders"),
            "supply": colecao.get("supply"),
            "source": "TRONSCAN"
        })

    return resultado
