'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export const description = 'A donut chart with text';

const chartData = [
  { browser: 'chrome', visitors: 1089, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 112, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 47, fill: 'var(--color-firefox)' },
  { browser: 'opera', visitors: 0, fill: 'var(--color-opera)' },
];

export function ChartPieDonutText() {
  const t = useTranslations('stats');

  const chartConfig = {
    visitors: { label: t('pieSafe') },
    chrome: { label: t('pieOnTime'), color: '#10B981' },
    safari: { label: t('pieApproaching'), color: '#FEA619' },
    firefox: { label: t('pieUrgent'), color: '#F97316' },
    opera: { label: t('pieExpired'), color: '#EF4444' },
  };

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className="w-[calc(50%-12px)] dark:bg-[#1D293D] md:max-w-80 flex flex-col rounded-[12px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t('pieTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-62.5">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="browser"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {t('pieLabelTotal')}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {t('pieTrending')} <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
