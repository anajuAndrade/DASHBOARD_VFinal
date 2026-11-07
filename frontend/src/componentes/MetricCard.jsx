function MetricCard({ titulo, valor }) {
  return (
    <div className="metric-card">
      <h3>{titulo}</h3>
      <p>{valor}</p>
    </div>
  );
}

export default MetricCard;