import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ElectrophoresisPoint {
  size: number;
  intensity: number;
  isProtein: boolean;
  isSecondary: boolean;
}

interface ElectrophoresisChartProps {
  data: ElectrophoresisPoint[];
  dnaLength: number;
  chartTicks: number[];
  justificationText: string;
}

const chartConfig = {
  intensity: {
    label: "Intensité",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function ElectrophoresisChart({
  data,
  dnaLength,
  chartTicks,
  justificationText
}: ElectrophoresisChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Électrophorèse
        </CardTitle>
        <CardDescription>
          Profil de migration ({dnaLength} pb)
        </CardDescription>
      </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-2">
        <div className="flex-1 w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart
              data={data}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="size"
                type="number"
                domain={['dataMin - 2', 'dataMax + 2']}
                ticks={chartTicks}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                fontSize={9}
                height={20}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                fontSize={9}
                width={30}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                  indicator="line"
                  formatter={(value) => [`${(value as number).toFixed(0)}`, "Intensité"]}
                  labelFormatter={(label) => `${label} pb`}
                />}
              />
              <Area
                dataKey="intensity"
                type="monotone"
                fill="var(--color-intensity)"
                fillOpacity={0.3}
                stroke="var(--color-intensity)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="text-xs text-gray-600 leading-tight">
          {justificationText}
        </div>
      </CardContent>
    </Card>
  );
} 