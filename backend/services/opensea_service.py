
import os
import requests


OPENSEA_BASE_URL = "https://api.opensea.io/api/v2"
COLLECTION_SLUG = "boredapeyachtclub"

_cache_blockchains = {}


def opensea_get(endpoint, params=None):
    """
    Realiza uma requisição GET à API da OpenSea.
    A chave é obtida do arquivo .env.
    """

    api_key = os.getenv("OPENSEA_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENSEA_API_KEY não foi encontrada no arquivo .env."
        )

    response = requests.get(
        f"{OPENSEA_BASE_URL}{endpoint}",
        headers={
            "X-API-KEY": api_key,
            "Accept": "application/json"
        },
        params=params,
        timeout=20
    )

    response.raise_for_status()

    return response.json()


def obter_blockchain_nft(item, resultado):
    """
    Identifica a blockchain de um NFT.

    Primeiro tenta obter a rede diretamente dos dados.
    Caso não consiga, consulta os contratos da coleção
    e compara o endereço do contrato do NFT.
    """

    for origem in (item, resultado):
        chain = origem.get("chain")

        if isinstance(chain, dict):
            chain = chain.get("identifier") or chain.get("name")

        if isinstance(chain, str) and chain.strip():
            return chain.strip().lower()

    contrato = (
        item.get("contract")
        or item.get("contract_address")
        or ""
    )

    if not contrato:
        return "Não identificada"

    colecao = (
        item.get("collection")
        or resultado.get("collection")
        or {}
    )

    if isinstance(colecao, dict):
        slug = (
            colecao.get("slug")
            or colecao.get("collection")
            or colecao.get("name")
        )
    else:
        slug = colecao

    if not isinstance(slug, str) or not slug.strip():
        return "Não identificada"

    slug = slug.strip().lower()

    if slug not in _cache_blockchains:
        try:
            dados_colecao = opensea_get(
                f"/collections/{slug}"
            )

            contratos = dados_colecao.get("contracts", [])

            _cache_blockchains[slug] = (
                contratos if isinstance(contratos, list) else []
            )

        except requests.exceptions.RequestException:
            _cache_blockchains[slug] = []

        except Exception:
            _cache_blockchains[slug] = []

    for dados_contrato in _cache_blockchains[slug]:
        if not isinstance(dados_contrato, dict):
            continue

        endereco_api = dados_contrato.get("address", "")

        if (
            isinstance(endereco_api, str)
            and endereco_api.lower() == contrato.lower()
        ):
            chain = dados_contrato.get("chain")

            if isinstance(chain, dict):
                chain = (
                    chain.get("identifier")
                    or chain.get("name")
                )

            if isinstance(chain, str) and chain.strip():
                return chain.strip().lower()

    return "Não identificada"
