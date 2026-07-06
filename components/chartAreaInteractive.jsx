'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

export function ChartAreaInteractive({ tests, devices }) {
  const t  = useTranslations('stats');
  const td = useTranslations('dashboard');

  const barData = React.useMemo(() => {
    if (!tests) return [];
    return [
      { name: t('barPassed'), value: tests.passed_on_time,   fill: '#10B981' },
      { name: t('barFailed'), value: tests.overdue_or_failed, fill: '#ef4444' },
      { name: t('barNever'),  value: devices?.never_tested ?? 0, fill: '#f59e0b' },
    ];
  }, [tests, devices, t]);

  const chartConfig = {
    value: { label: td('testsTotal') },
  };

  return (
    <Card className="flex-1 min-w-72 rounded-2xl dark:bg-slate-800 border-[rgba(197,198,207,0.30)] dark:border-slate-700/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-[15px]">{t('barTitle')}</CardTitle>
        <CardDescription className="text-[12px]">
          {td('testsTotal')}: {tests?.total_logged ?? 0}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-44 w-full">
          <BarChart data={barData} barSize={32} layout="vertical">
            <CartesianGrid horizontal={false} className="stroke-[#E2E8F0] dark:stroke-slate-700/50" />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#7B8499' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={118}
              tick={{ fontSize: 12, fill: '#7B8499' }}
            />
            <ChartTooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
