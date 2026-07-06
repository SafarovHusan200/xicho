'use client';

import * as React from 'react';
import { Cell, Label, Pie, PieChart } from 'recharts';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const SLICES = [
  { key: 'active',      labelKey: 'pieActive',      color: '#10B981' },
  { key: 'inactive',    labelKey: 'pieInactive',     color: '#94a3b8' },
  { key: 'neverTested', labelKey: 'pieNeverTested',  color: '#f59e0b' },
];

export function ChartPieDonutText({ devices }) {
  const t  = useTranslations('stats');
  const td = useTranslations('dashboard');

  const chartData = React.useMemo(() => {
    if (!devices) return [];
    return [
      { name: t('pieActive'),      value: devices.active,       fill: '#10B981' },
      { name: t('pieInactive'),    value: devices.inactive,     fill: '#94a3b8' },
      { name: t('pieNeverTested'), value: devices.never_tested, fill: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [devices, t]);

  const total = devices?.total ?? 0;

  const empty = [{ name: '—', value: 1, fill: '#e2e8f0' }];

  const chartConfig = {
    value: { label: t('pieLabelTotal') },
  };

  return (
    <Card className="flex-1 min-w-60 max-w-75 rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="text-[15px]">{t('pieTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-50">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData.length ? chartData : empty}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              strokeWidth={4}
            >
              {(chartData.length ? chartData : empty).map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {total}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-muted-foreground text-xs">
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

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
          {(chartData.length ? chartData : []).map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
              <span className="text-[#44474E] dark:text-slate-400">
                {d.name}:{' '}
                <strong className="text-[#031634] dark:text-slate-100">{d.value}</strong>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
