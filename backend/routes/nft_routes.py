import requests

from flask import Blueprint, jsonify, request

from services.opensea_service import (
    COLLECTION_SLUG,
    opensea_get,
    obter_blockchain_nft
)
from services.defillama_service import obter_dados_defi
from services.rwa_service import obter_dados_rwa
from services.coingecko_service import obter_colecoes_rede
from services.tron_service import obter_colecoes_tron

nft_routes = Blueprint("nft_routes", __name__)


@nft_routes.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Flask",
        "provider": "OpenSea",
    })

@nft_routes.route("/dashboard", methods=["GET"])
def dashboard():
    try:
        chain = request.args.get("chain", "ethereum").strip().lower()


        if chain not in ["ethereum", "polygon", "solana", "arbitrum", "base", "avalanche"]:
            return jsonify({
                "error": "Esta rede ainda não possui suporte para o dashboard agregado.",
                "chain": chain
            }), 400

        collections_response = opensea_get(
            "/collections/top",
            {
                "chains": [chain],
                "limit": 10
            }
        )

        collections_api = collections_response.get("collections", [])

        colecoes = []
        volumes_por_periodo = {}
        transacoes = []

        vendas_24h = 0
        volume_24h = 0
        volumes_disponiveis = 0
        floors = []
        simbolos_volume = set()

        for item in collections_api:
            slug = item.get("collection")

            if not slug:
                continue

            contratos = item.get("contracts") or []
            blockchain = (
                contratos[0].get("chain", chain)
                if contratos else chain
            )

            colecao = {
                "slug": slug,
                "name": item.get("name") or slug,
                "chain": blockchain,
                "image_url": item.get("image_url"),
                "opensea_url": item.get("opensea_url")
                    or f"https://opensea.io/collection/{slug}",
                "floor_price": None,
                "floor_price_symbol": None,
                "volume_24h": None,
                "volume_24h_symbol": None,
                "sales_24h": None
            }

            try:
                stats_response = opensea_get(
                    f"/collections/{slug}/stats"
                )

                total = stats_response.get("total", {})
                intervals = stats_response.get("intervals", [])

                one_day = next(
                    (
                        interval for interval in intervals
                        if interval.get("interval") == "one_day"
                    ),
                    {}
                )

                floor = total.get("floor_price")

                if floor is not None:
                    colecao["floor_price"] = floor
                    colecao["floor_price_symbol"] = (
                        total.get("floor_price_symbol") or "ETH"
                    )
                    floors.append(float(floor))

                volume = one_day.get("volume")
                simbolo = one_day.get("volume_symbol")

                if volume is not None:
                    colecao["volume_24h"] = volume
                    colecao["volume_24h_symbol"] = simbolo

                    if simbolo:
                        simbolos_volume.add(simbolo)
                    volumes_disponiveis += 1

                vendas = one_day.get("sales")

                if vendas is not None:
                    colecao["sales_24h"] = vendas
                    vendas_24h += int(vendas)

                for intervalo in intervals:
                    nome_intervalo = intervalo.get("interval")
                    volume_intervalo = intervalo.get("volume")

                    if nome_intervalo and volume_intervalo is not None:
                        if nome_intervalo not in volumes_por_periodo:
                            volumes_por_periodo[nome_intervalo] = {
                                "volume": 0,
                                "sales": 0
                            }

                        volumes_por_periodo[nome_intervalo]["volume"] += float(
                            volume_intervalo
                        )

                        volumes_por_periodo[nome_intervalo]["sales"] += int(
                            intervalo.get("sales") or 0
                        )

                colecoes.append(colecao)

                if len(colecoes) <= 5:
                    events_response = opensea_get(
                        f"/events/collection/{slug}",
                        {
                            "event_type": "sale",
                            "limit": 10
                        }
                    )

                    eventos = events_response.get(
                        "asset_events",
                        events_response.get("events", [])
                    )

                    if isinstance(eventos, list):
                        for evento in eventos:
                            evento["_collection_name"] = colecao["name"]
                            transacoes.append(evento)

            except requests.exceptions.RequestException:
                continue

        volume_total = None
        simbolo_total = None

        if volumes_disponiveis > 0 and len(simbolos_volume) == 1:
            volume_total = sum(
                float(colecao["volume_24h"])
                for colecao in colecoes
                if colecao["volume_24h"] is not None
            )
            simbolo_total = next(iter(simbolos_volume))

        floor_medio = (
            sum(floors) / len(floors)
            if floors else None
        )

        transacoes.sort(
            key=lambda evento: evento.get("event_timestamp") or "",
            reverse=True
        )

        ordem_intervalos = [
            "one_day",
            "seven_day",
            "thirty_day"
        ]

        historico = []

        for intervalo in ordem_intervalos:
            if intervalo in volumes_por_periodo:
                historico.append({
                    "interval": intervalo,
                    "volume": volumes_por_periodo[intervalo]["volume"],
                    "sales": volumes_por_periodo[intervalo]["sales"]
                })

        return jsonify({
            "chain": chain,
            "source": "OpenSea",
            "scope": "Principais coleções consultadas",
            "collection_count": len(colecoes),

            "metrics": {
                "sales_24h": vendas_24h,
                "volume_24h": volume_total,
                "volume_symbol": simbolo_total,
                "average_floor_price": floor_medio,
                "floor_collections_count": len(floors)
            },

            "collections": colecoes,
            "top_collections": colecoes[:5],
            "trades": transacoes[:10],
            "history": historico
        })

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao consultar os dados da OpenSea.",
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            )
        }), status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar à OpenSea.",
            "details": str(error)
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro interno ao carregar o dashboard.",
            "details": str(error)
        }), 500


@nft_routes.route("/collections", methods=["GET"])
def collections():
    try:
        chain_filters = [
            chain.strip().lower()
            for chain in request.args.getlist("chain")
            if chain.strip()
        ]

        if len(chain_filters) == 1 and chain_filters[0] in ["bsc", "bitcoin"]:
            rede = chain_filters[0]
            resultado = obter_colecoes_rede(rede)

            return jsonify({
                "collections": resultado,
                "count": len(resultado),
                "source": "CoinGecko"
            })

        params = {
            "sort_by": "one_day_volume",
            "limit": 10,
        }
        if len(chain_filters) == 1 and chain_filters[0] == "tron":
            resultado = obter_colecoes_tron()
            return jsonify({
                "collections": resultado,
                "count": len(resultado),
                "source": "TRONSCAN"
            })
        
        if chain_filters:
            params["chains"] = chain_filters

        response = opensea_get("/collections/top", params)
        collections_data = response.get("collections", [])
        resultado = []

        for item in collections_data:
            slug = item.get("collection")

            if not slug:
                continue

            contracts = item.get("contracts") or []
            chain = (
                contracts[0].get("chain", "ethereum")
                if contracts
                else "ethereum"
            )

            collection_info = {
                "slug": slug,
                "name": item.get("name") or slug,
                "chain": chain,
                "image_url": item.get("image_url"),
                "description": item.get("description"),
                "opensea_url": item.get("opensea_url")
                or f"https://opensea.io/collection/{slug}",
                "floor_price": None,
                "floor_price_symbol": None,
                "volume_24h": None,
                "volume_24h_symbol": None,
                "sales_24h": None,
                "total_sales": None,
            }

            try:
                stats = opensea_get(f"/collections/{slug}/stats")
                total = stats.get("total", {})
                intervals = stats.get("intervals", [])

                one_day = next(
                    (
                        interval
                        for interval in intervals
                        if interval.get("interval") == "one_day"
                    ),
                    {},
                )

                collection_info.update({
                    "floor_price": total.get("floor_price"),
                    "floor_price_symbol": total.get(
                        "floor_price_symbol"
                    ),
                    "volume_24h": one_day.get("volume"),
                    "volume_24h_symbol": one_day.get("volume_symbol"),
                    "sales_24h": one_day.get("sales"),
                    "total_sales": total.get("sales"),
                })

            except requests.exceptions.RequestException:
                pass

            resultado.append(collection_info)

        return jsonify({
            "collections": resultado,
            "count": len(resultado),
            "source": "OpenSea",
        })

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao consultar coleções na OpenSea.",
            "status": status,
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            ),
        }), 502 if status >= 500 else status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar à OpenSea.",
            "details": str(error),
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro interno ao carregar coleções.",
            "details": str(error),
        }), 500


@nft_routes.route("/collections/search", methods=["GET"])
def search_collections():
    query = request.args.get("q", "").strip()
    chains = [
        chain.strip().lower()
        for chain in request.args.getlist("chain")
        if chain.strip()
    ]

    if len(query) < 2:
        return jsonify({
            "collections": [],
            "count": 0,
            "source": "OpenSea",
        })

    try:
        params = [
            ("query", query),
            ("asset_types", "collection"),
            ("limit", "20"),
        ]

        for chain in chains:
            params.append(("chains", chain))

        response = opensea_get("/search", params)
        resultados_api = response.get("results", [])
        colecoes_encontradas = []
        slugs_vistos = set()

        for resultado in resultados_api:
            if resultado.get("type") != "collection":
                continue

            item = resultado.get("collection") or {}
            slug = item.get("collection") or item.get("slug")

            if not slug or slug in slugs_vistos:
                continue

            slugs_vistos.add(slug)

            colecao = {
                "slug": slug,
                "name": item.get("name") or slug,
                "chain": chains[0] if len(chains) == 1 else (
                    item.get("chain") or "Blockchain"
                ),
                "image_url": item.get("image_url"),
                "description": item.get("description"),
                "opensea_url": item.get("opensea_url")
                or f"https://opensea.io/collection/{slug}",
                "floor_price": None,
                "floor_price_symbol": None,
                "volume_24h": None,
                "volume_24h_symbol": None,
                "sales_24h": None,
                "total_sales": None,
            }

            try:
                stats = opensea_get(f"/collections/{slug}/stats")
                total = stats.get("total", {})
                intervals = stats.get("intervals", [])

                one_day = next(
                    (
                        intervalo
                        for intervalo in intervals
                        if intervalo.get("interval") == "one_day"
                    ),
                    {},
                )

                colecao.update({
                    "floor_price": total.get("floor_price"),
                    "floor_price_symbol": total.get(
                        "floor_price_symbol"
                    ),
                    "volume_24h": one_day.get("volume"),
                    "volume_24h_symbol": one_day.get(
                        "volume_symbol"
                    ),
                    "sales_24h": one_day.get("sales"),
                    "total_sales": total.get("sales"),
                })

            except requests.exceptions.RequestException:
                pass

            colecoes_encontradas.append(colecao)

        return jsonify({
            "collections": colecoes_encontradas,
            "count": len(colecoes_encontradas),
            "source": "OpenSea",
        })

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao pesquisar coleções na OpenSea.",
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            ),
        }), 502 if status >= 500 else status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar à OpenSea.",
            "details": str(error),
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro interno ao pesquisar coleções.",
            "details": str(error),
        }), 500


@nft_routes.route("/nfts/search", methods=["GET"])
def search_nfts():
    query = request.args.get("q", "").strip()

    if len(query) < 2:
        return jsonify({
            "nfts": [],
            "count": 0,
            "source": "OpenSea",
        })

    try:
        params = [
            ("query", query),
            ("asset_types", "nft"),
            ("limit", "20"),
        ]

        response = opensea_get("/search", params)
        resultados_api = response.get("results", [])

        nfts_encontrados = []
        ids_vistos = set()

        for resultado in resultados_api:
            if resultado.get("type") != "nft":
                continue

            item = resultado.get("nft") or {}

            identificador = (
                item.get("identifier")
                or item.get("token_id")
                or item.get("id")
            )

            contrato = (
                item.get("contract")
                or item.get("contract_address")
                or ""
            )

            chave = f"{contrato}:{identificador}"

            if chave in ids_vistos:
                continue

            ids_vistos.add(chave)

            colecao = item.get("collection") or {}

            if isinstance(colecao, dict):
                nome_colecao = (
                    colecao.get("name") or colecao.get("slug")
                )
            else:
                nome_colecao = colecao

            imagem = (
                item.get("display_image_url")
                or item.get("image_url")
                or item.get("image")
            )

            nft = {
                "id": item.get("id") or chave,
                "identifier": identificador,
                "name": item.get("name")
                or f"NFT #{identificador or '?'}",
                "contract": contrato,
                "collection": nome_colecao,
                "chain": obter_blockchain_nft(item, resultado),
                "image_url": imagem,
                "opensea_url": item.get("opensea_url"),
            }

            nfts_encontrados.append(nft)

        return jsonify({
            "nfts": nfts_encontrados,
            "count": len(nfts_encontrados),
            "source": "OpenSea",
        })

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao pesquisar NFTs na OpenSea.",
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            ),
        }), 502 if status >= 500 else status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar à OpenSea.",
            "details": str(error),
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro interno ao pesquisar NFTs.",
            "details": str(error),
        }), 500


@nft_routes.route("/transactions", methods=["GET"])
def listar_transacoes():
    try:
        limite = request.args.get("limit", default=20, type=int)
        limite = max(1, min(limite, 50))

        params = [
            ("event_type", "sale"),
            ("limit", str(limite)),
        ]

        # Período informado pelo frontend (Unix timestamp em segundos)
        depois = request.args.get("after", type=int)
        antes = request.args.get("before", type=int)

        if depois is not None and antes is not None and depois > antes:
            return jsonify({
                "error": "A data inicial deve ser anterior à data final."
            }), 400

        if depois is not None:
            params.append(("after", str(depois)))

        if antes is not None:
            params.append(("before", str(antes)))

        # Consulta a OpenSea apenas uma vez
        resposta = opensea_get("/events", params)
        eventos = resposta.get("asset_events", [])

        transacoes = []

        for evento in eventos:
            nft = evento.get("nft") or evento.get("asset") or {}
            pagamento = evento.get("payment") or {}

            colecao = nft.get("collection") or {}

            if isinstance(colecao, dict):
                nome_colecao = (
                    colecao.get("name")
                    or colecao.get("slug")
                    or "Coleção não informada"
                )
            else:
                nome_colecao = colecao or "Coleção não informada"

            quantidade = pagamento.get("quantity")
            decimais = pagamento.get("decimals")
            preco = None

            if quantidade is not None and decimais is not None:
                try:
                    preco = int(quantidade) / (10 ** int(decimais))
                except (ValueError, TypeError, OverflowError):
                    preco = None

            identificador = (
                nft.get("identifier")
                or nft.get("token_id")
                or nft.get("id")
            )

            imagem = (
                nft.get("display_image_url")
                or nft.get("image_url")
                or nft.get("image")
            )

            transacoes.append({
                "id": (
                    evento.get("transaction")
                    or f"{nft.get('contract', '')}:{identificador}"
                ),
                "name": nft.get("name") or (
                    f"NFT #{identificador}"
                    if identificador is not None
                    else "NFT sem nome"
                ),
                "identifier": identificador,
                "collection": nome_colecao,
                "chain": evento.get("chain") or "Não identificada",
                "contract": nft.get("contract"),
                "image_url": imagem,
                "price": preco,
                "currency": pagamento.get("symbol")
                or "Moeda não informada",
                "timestamp": evento.get("event_timestamp"),
                "transaction_hash": evento.get("transaction"),
                "seller": evento.get("seller") or evento.get("maker"),
                "buyer": evento.get("buyer") or evento.get("taker"),
                "opensea_url": nft.get("opensea_url"),
            })

        return jsonify({
            "transactions": transacoes,
            "count": len(transacoes),
            "source": "OpenSea",
        })

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao buscar transações na OpenSea.",
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            ),
        }), 502 if status >= 500 else status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar à OpenSea.",
            "details": str(error),
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro interno ao buscar transações.",
            "details": str(error),
        }), 500


@nft_routes.route("/defi/dashboard", methods=["GET"])
def dashboard_defi():
    try:
        dados = obter_dados_defi()
        return jsonify(dados)

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao consultar os dados do DeFiLlama.",
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            ),
        }), 502 if status >= 500 else status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar ao DeFiLlama.",
            "details": str(error),
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro ao carregar o dashboard DeFi.",
            "details": str(error),
        }), 500


@nft_routes.route("/rwa/dashboard", methods=["GET"])
def dashboard_rwa():
    try:
        dados = obter_dados_rwa()
        return jsonify(dados)

    except requests.exceptions.HTTPError as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        return jsonify({
            "error": "Erro ao consultar os dados do RWA Pipe.",
            "details": (
                error.response.text[:1000]
                if error.response is not None
                else str(error)
            ),
        }), 502 if status >= 500 else status

    except requests.exceptions.RequestException as error:
        return jsonify({
            "error": "Não foi possível conectar ao RWA Pipe.",
            "details": str(error),
        }), 502

    except Exception as error:
        return jsonify({
            "error": "Erro ao carregar o dashboard RWA.",
            "details": str(error),
        }), 500
