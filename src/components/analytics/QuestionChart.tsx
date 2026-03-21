import { useState } from 'react';
import ReactEChartsCore from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { BarChart, PieChart, GaugeChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Button, Tag } from '@carbon/react';
import type { QuestionStat } from '@/types/analytics';

echarts.use([
  BarChart,
  PieChart,
  GaugeChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

interface QuestionChartProps {
  stat: QuestionStat;
}

function getChartType(stat: QuestionStat) {
  if (stat.questionType === 'rating_nps') return 'nps';
  if (['multiple_choice', 'multi_select', 'dropdown', 'yes_no'].includes(stat.questionType)) return 'pie';
  if (['rating_likert', 'rating_star', 'rating_emoji', 'slider'].includes(stat.questionType)) return 'rating';
  if (['short_text', 'long_text'].includes(stat.questionType)) return 'text';
  return 'bar';
}

function NPSGaugeChart({ score, breakdown }: { score: number; breakdown?: QuestionStat['npsBreakdown'] }) {
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: -100,
        max: 100,
        splitNumber: 4,
        itemStyle: {
          color: score >= 50 ? '#198038' : score >= 0 ? '#f1c21b' : '#da1e28',
        },
        progress: {
          show: true,
          width: 20,
        },
        pointer: {
          length: '60%',
          width: 6,
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.25, '#da1e28'],
              [0.5, '#f1c21b'],
              [0.75, '#fddc69'],
              [1, '#198038'],
            ],
          },
        },
        axisTick: { distance: -30, length: 6, lineStyle: { color: '#999', width: 1 } },
        splitLine: { distance: -40, length: 14, lineStyle: { color: '#999', width: 2 } },
        axisLabel: { distance: -20, color: '#999', fontSize: 12 },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          fontSize: 36,
          offsetCenter: [0, '40%'],
        },
        data: [{ value: score }],
      },
    ],
  };

  return (
    <div className="nps-gauge">
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 200, width: '100%' }}
        notMerge
      />
      {breakdown && (
        <div className="nps-gauge__breakdown">
          <div className="nps-gauge__breakdown-item nps-gauge__breakdown-item--promoter">
            <span>{breakdown.promoterCount}</span>
            <p>Promoters</p>
          </div>
          <div className="nps-gauge__breakdown-item nps-gauge__breakdown-item--passive">
            <span>{breakdown.passiveCount}</span>
            <p>Passives</p>
          </div>
          <div className="nps-gauge__breakdown-item nps-gauge__breakdown-item--detractor">
            <span>{breakdown.detractorCount}</span>
            <p>Detractors</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TextStatsDisplay({ textStats }: { textStats: NonNullable<QuestionStat['textStats']> }) {
  if (!textStats) return null;

  return (
    <div className="question-chart__text-stats">
      <div className="question-chart__text-stats-summary">
        <span><strong>{textStats.totalResponses}</strong> responses</span>
        <span>Avg. <strong>{textStats.averageWordCount}</strong> words</span>
      </div>
      {textStats.topWords.length > 0 && (
        <div>
          <p className="font-semibold text-sm text-neutral-900 mb-2">Top Words</p>
          <div className="flex gap-2 flex-wrap">
            {textStats.topWords.map((w) => (
              <Tag type="cool-gray" key={w.word}>
                {w.word} ({w.count})
              </Tag>
            ))}
          </div>
        </div>
      )}
      {textStats.sampleResponses.length > 0 && (
        <div>
          <p className="font-semibold text-sm text-neutral-900 mb-2">Sample Responses</p>
          <ul className="list-disc pl-5 m-0">
            {textStats.sampleResponses.map((r, i) => (
              <li key={i} className="mb-1 text-sm text-neutral-900">
                &ldquo;{r}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function QuestionChart({ stat }: QuestionChartProps) {
  const [chartMode, setChartMode] = useState<'bar' | 'pie'>('bar');
  const chartType = getChartType(stat);

  const barOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: stat.distribution.map((d) => d.label),
      axisLabel: { rotate: stat.distribution.length > 6 ? 45 : 0 },
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        data: stat.distribution.map((d) => d.count),
        type: 'bar',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        ...(stat.average !== undefined
          ? {
              markLine: {
                silent: true,
                symbol: 'none',
                data: [{ yAxis: stat.average, label: { formatter: `Avg: ${stat.average.toFixed(1)}`, position: 'insideEndTop' } }],
                lineStyle: { color: '#0f62fe', type: 'dashed' as const },
              },
            }
          : {}),
      },
    ],
  };

  const pieOption = {
    tooltip: { trigger: 'item' as const },
    legend: { orient: 'vertical' as const, left: 'left', top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: stat.distribution.map((d) => ({
          name: d.label,
          value: d.count,
        })),
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
        label: { show: true, formatter: '{b}: {d}%' },
      },
    ],
  };

  const ratingOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: stat.distribution.map((d) => d.label),
    },
    yAxis: { type: 'value' as const, max: stat.distribution.length > 0 ? undefined : 10 },
    series: [
      {
        data: stat.distribution.map((d) => d.count),
        type: 'bar',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params: any) => {
            const colors = ['#da1e28', '#fa4d56', '#f1c21b', '#fddc69', '#42be65', '#198038', '#0f62fe'];
            return colors[params.dataIndex % colors.length];
          },
        },
        markLine:
          stat.average !== undefined
            ? {
                silent: true,
                symbol: 'none',
                data: [{ yAxis: stat.average, label: { formatter: `Avg: ${stat.average.toFixed(1)}`, position: 'insideEndTop' } }],
                lineStyle: { color: '#0f62fe', type: 'dashed' as const },
              }
            : undefined,
      },
    ],
  };

  return (
    <div className="question-chart">
      <div className="question-chart__header">
        <h5 className="question-chart__title">{stat.questionTitle}</h5>
        {(chartType === 'pie' || chartType === 'bar') && stat.distribution.length > 0 && (
          <div className="question-chart__toggle">
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setChartMode('bar')}
              disabled={chartMode === 'bar'}
            >
              Bar
            </Button>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setChartMode('pie')}
              disabled={chartMode === 'pie'}
            >
              Pie
            </Button>
          </div>
        )}
      </div>
      <p className="question-chart__meta">
        {stat.responseCount} responses | {stat.skipCount} skipped
        {stat.average !== undefined && ` | Avg: ${stat.average.toFixed(1)}`}
        {stat.npsScore !== undefined && ` | NPS: ${stat.npsScore}`}
      </p>

      {chartType === 'nps' && stat.npsScore !== undefined ? (
        <NPSGaugeChart score={stat.npsScore} breakdown={stat.npsBreakdown} />
      ) : chartType === 'text' && stat.textStats ? (
        <TextStatsDisplay textStats={stat.textStats} />
      ) : chartType === 'rating' ? (
        <ReactEChartsCore
          echarts={echarts}
          option={ratingOption}
          style={{ height: 300, width: '100%' }}
          notMerge
        />
      ) : (
        <ReactEChartsCore
          echarts={echarts}
          option={chartMode === 'pie' ? pieOption : barOption}
          style={{ height: 300, width: '100%' }}
          notMerge
        />
      )}
    </div>
  );
}
