import SecurityDashboard from "../components/SecurityDashboard";

export default function Security() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl heading text-slate-900">Dashboard de Segurança</h2>
        <p className="text-slate-500 font-medium mt-1">Indicadores e gráficos de integridade, consumo de tokens da vic IA e segurança cibernética.</p>
      </div>

      <SecurityDashboard />
    </div>
  );
}
