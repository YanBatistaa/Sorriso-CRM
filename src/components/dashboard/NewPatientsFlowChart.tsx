import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parse, isValid, format, startOfWeek, addWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// A função de formatação agora vive junto com o gráfico que a utiliza
const formatXAxisTick = (tickItem: string) => {
  try {
    if (tickItem.includes('-S')) {
      const [yearStr, weekStr] = tickItem.replace('S', '').split('-');
      const year = parseInt(yearStr);
      const weekNumber = parseInt(weekStr);
      const firstDayOfYear = new Date(year, 0, 1);
      const dateWithWeeks = addWeeks(firstDayOfYear, weekNumber - 1);
      const startOfTheWeek = startOfWeek(dateWithWeeks, { weekStartsOn: 1 });
      if (isValid(startOfTheWeek)) {
        return format(startOfTheWeek, 'dd/MMM', { locale: ptBR });
      }
    }
    if (tickItem.match(/^\d{4}-\d{2}$/)) {
      const date = parse(tickItem, 'yyyy-MM', new Date());
      if (isValid(date)) {
        return format(date, 'MMM/yy', { locale: ptBR });
      }
    }
    return tickItem;
  } catch (error) {
    return tickItem;
  }
};

interface ChartData {
  period: string;
  total: number;
}

interface NewPatientsFlowChartProps {
  data: ChartData[];
}

export const NewPatientsFlowChart = ({ data }: NewPatientsFlowChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" fontSize={12} tickFormatter={formatXAxisTick} />
        <YAxis fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
          }}
        />
        <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};