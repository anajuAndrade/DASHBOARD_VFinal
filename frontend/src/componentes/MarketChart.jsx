import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function MarketChart({ intervals = [], currency = "ETH" }) {
    const nomesPeriodos = {
        one_day: "24 horas",
        seven_day: "7 dias",
        thirty_day: "30 dias",
    };

    const ordemPeriodos = ["one_day", "seven_day", "thirty_day"];

    const dadosGrafico = ordemPeriodos
        .map((intervalo) => {
            const item = intervals.find(
                (registro) => registro.interval === intervalo
            );

            if (!item || item.volume === null || item.volume === undefined) {
                return null;
            }

            return {
                periodo: nomesPeriodos[intervalo],
                volume: Number(item.volume),
            };
        })
        .filter(Boolean);

    return (
        <div className="market-chart">
            <div className="chart-header">
                <div>
                    <p>Volume de vendas por período ({currency})</p>
                </div>
            </div>

            {dadosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height={290}>
                    <AreaChart
                        data={dadosGrafico}
                        margin={{
                            top: 15,
                            right: 10,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="corVolume"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.35}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#8b5cf6"
                                    stopOpacity={0.02}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="5 5"
                            stroke="rgba(255,255,255,0.12)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="periodo"
                            stroke="#777"
                            tick={{ fill: "#aaa", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            stroke="#777"
                            tick={{ fill: "#888", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            formatter={(valor) => [
                                `${Number(valor).toLocaleString("pt-BR", {
                                    maximumFractionDigits: 4,
                                })} ${currency}`,
                                "Volume",
                            ]}
                            contentStyle={{
                                backgroundColor: "#1e1e2f",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="volume"
                            name="Volume"
                            stroke="#9b6bff"
                            strokeWidth={3}
                            fill="url(#corVolume)"
                            dot={{
                                r: 4,
                                fill: "#c4a5ff",
                                stroke: "#8b5cf6",
                                strokeWidth: 2,
                            }}
                            activeDot={{
                                r: 6,
                                fill: "#c4a5ff",
                                stroke: "#fff",
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <p>Não há dados de volume disponíveis.</p>
            )}
        </div>
    );
}

export default MarketChart;
