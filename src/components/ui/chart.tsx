import { cn } from "@/lib/utils";
import React, { HTMLAttributes } from "react";
import { BarChart as RechartsBarChart, LineChart as RechartsLineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// --- Bar Chart ---
interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
}

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ data, xAxisKey, yAxisKey, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("h-full w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey={yAxisKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
BarChart.displayName = "BarChart";

// --- Line Chart ---
interface LineChartProps extends HTMLAttributes<HTMLDivElement> {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  xAxisTickFormatter?: (value: any) => string;
}

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  ({ data, xAxisKey, yAxisKey, xAxisTickFormatter, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("h-full w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} fontSize={12} tickLine={false} axisLine={false} tickFormatter={xAxisTickFormatter} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Line type="monotone" dataKey={yAxisKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);
LineChart.displayName = "LineChart";