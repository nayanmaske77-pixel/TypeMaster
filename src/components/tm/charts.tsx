import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axis = { stroke: "var(--muted-foreground)", fontSize: 12, tickLine: false, axisLine: false };
const tooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
};

export function WpmLine({ data, height = 260 }: { data: { label: string; wpm: number; accuracy?: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis {...axis} />
        <Tooltip {...tooltip} />
        <Area type="monotone" dataKey="wpm" name="WPM" stroke="var(--chart-1)" strokeWidth={3} fill="url(#wpmFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AccuracyLine({ data }: { data: { label: string; accuracy: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis domain={[0, 100]} {...axis} />
        <Tooltip {...tooltip} />
        <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, dataKey, name, color = "var(--chart-3)" }: { data: object[]; dataKey: string; name: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis {...axis} allowDecimals={false} />
        <Tooltip {...tooltip} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey={dataKey} name={name} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
