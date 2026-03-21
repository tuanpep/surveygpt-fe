import ReactEChartsCore from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { DailyResponseCount } from '@/types/analytics';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface ResponseOverTimeProps {
  data: DailyResponseCount[];
}

export function ResponseOverTime({ data }: ResponseOverTimeProps) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#525252', textAlign: 'center', padding: '2rem' }}>No response data available.</p>;
  }

  const option = {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'cross' as const },
    },
    legend: {
      data: ['Total', 'Completed'],
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', top: '10%', bottom: '12%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      boundaryGap: false,
    },
    yAxis: { type: 'value' as const, minInterval: 1 },
    series: [
      {
        name: 'Total',
        type: 'line',
        data: data.map((d) => d.count),
        smooth: true,
        areaStyle: { opacity: 0.1 },
        lineStyle: { width: 2 },
        itemStyle: { color: '#0f62fe' },
      },
      {
        name: 'Completed',
        type: 'line',
        data: data.map((d) => d.completed),
        smooth: true,
        areaStyle: { opacity: 0.1 },
        lineStyle: { width: 2 },
        itemStyle: { color: '#198038' },
      },
    ],
  };

  return (
    <div className="question-chart">
      <h5 className="response-over-time__title">Responses Over Time</h5>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 280, width: '100%' }}
        notMerge
      />
    </div>
  );
}
