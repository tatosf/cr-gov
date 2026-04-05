"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import indicatorData from "@/data/seed/economic-indicators.json";
import { formatDate } from "@/lib/utils/format";

const exchangeData = indicatorData.exchangeRate.map((d) => ({
  ...d,
  label: formatDate(d.date),
  spread: +(d.sell - d.buy).toFixed(2),
}));

const tbpData = indicatorData.tbp.map((d) => ({
  ...d,
  label: formatDate(d.date),
}));

const inflationData = indicatorData.inflation.map((d) => ({
  ...d,
  label: formatDate(d.date),
}));

const latestRate = indicatorData.exchangeRate[indicatorData.exchangeRate.length - 1];
const latestTbp = indicatorData.tbp[indicatorData.tbp.length - 1];
const latestInflation = indicatorData.inflation[indicatorData.inflation.length - 1];

function StatCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up"
      ? "text-red-500"
      : trend === "down"
        ? "text-green-500"
        : "text-muted";
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="text-sm text-muted mb-1">{title}</div>
      <div className={`text-2xl font-bold ${trendColor}`}>{value}</div>
      <div className="text-xs text-muted mt-1">{subtitle}</div>
    </div>
  );
}

export default function EconomiaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Indicadores Económicos</h1>
        <p className="text-muted mt-2">
          Datos del Banco Central de Costa Rica (BCCR). Actualizados diariamente.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Tipo de Cambio (Compra)"
          value={`₡${latestRate.buy.toFixed(2)}`}
          subtitle={`Venta: ₡${latestRate.sell.toFixed(2)}`}
          trend="up"
        />
        <StatCard
          title="Spread"
          value={`₡${(latestRate.sell - latestRate.buy).toFixed(2)}`}
          subtitle="Diferencia compra/venta"
          trend="neutral"
        />
        <StatCard
          title="Tasa Básica Pasiva"
          value={`${latestTbp.value}%`}
          subtitle="Tasa de referencia"
          trend="down"
        />
        <StatCard
          title="Inflación Interanual"
          value={`${latestInflation.value}%`}
          subtitle="Variación IPC"
          trend="up"
        />
      </div>

      {/* Exchange Rate Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-1">
          Tipo de Cambio USD/CRC
        </h2>
        <p className="text-sm text-muted mb-4">
          Evolución del tipo de cambio de compra y venta del dólar estadounidense
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={exchangeData}>
            <defs>
              <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d5a8e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2d5a8e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c8102e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#c8102e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={Math.floor(exchangeData.length / 8)}
            />
            <YAxis
              domain={["dataMin - 5", "dataMax + 5"]}
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `₡${v}`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `₡${value.toFixed(2)}`,
                name === "buy" ? "Compra" : "Venta",
              ]}
              labelFormatter={(label: string) => `Fecha: ${label}`}
            />
            <Legend
              formatter={(value: string) =>
                value === "buy" ? "Compra" : "Venta"
              }
            />
            <Area
              type="monotone"
              dataKey="buy"
              stroke="#2d5a8e"
              strokeWidth={2}
              fill="url(#colorBuy)"
            />
            <Area
              type="monotone"
              dataKey="sell"
              stroke="#c8102e"
              strokeWidth={2}
              fill="url(#colorSell)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* TBP Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-1">Tasa Básica Pasiva</h2>
          <p className="text-sm text-muted mb-4">
            Tasa de referencia del sistema financiero nacional
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tbpData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "TBP"]}
                labelFormatter={(label: string) => `Fecha: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7ab648"
                strokeWidth={2}
                dot={{ r: 4, fill: "#7ab648" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Inflation Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-1">Inflación Interanual</h2>
          <p className="text-sm text-muted mb-4">
            Variación porcentual del Índice de Precios al Consumidor
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={inflationData}>
              <defs>
                <linearGradient
                  id="colorInflation"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f5a623" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                domain={[0, "dataMax + 1"]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(2)}%`,
                  "Inflación",
                ]}
                labelFormatter={(label: string) => `Mes: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f5a623"
                strokeWidth={2}
                fill="url(#colorInflation)"
                dot={{ r: 4, fill: "#f5a623" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source note */}
      <div className="mt-8 text-center text-sm text-muted">
        <p>
          Fuente:{" "}
          <a
            href="https://www.bccr.fi.cr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Banco Central de Costa Rica
          </a>{" "}
          — Datos de ejemplo para demostración
        </p>
      </div>
    </div>
  );
}
