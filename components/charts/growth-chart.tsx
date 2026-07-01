"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { growthData } from "@/data/mock-data";

export function GrowthChart() {
  return (
    <div className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={growthData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-leads))" stopOpacity={0.32} />
              <stop offset="95%" stopColor="hsl(var(--chart-leads))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="qualified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-qualified))" stopOpacity={0.28} />
              <stop offset="95%" stopColor="hsl(var(--chart-qualified))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tickLine={false} axisLine={false} width={36} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "hsl(var(--border))",
              background: "hsl(var(--popover))",
              color: "hsl(var(--popover-foreground))"
            }}
          />
          <Area type="monotone" dataKey="leads" stroke="hsl(var(--chart-leads))" strokeWidth={2.5} fillOpacity={1} fill="url(#leads)" />
          <Area type="monotone" dataKey="qualified" stroke="hsl(var(--chart-qualified))" strokeWidth={2.5} fillOpacity={1} fill="url(#qualified)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
