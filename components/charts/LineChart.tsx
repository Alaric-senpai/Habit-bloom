import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText, G } from 'react-native-svg';

interface ChartDataPoint {
  value: number;
  label: string;
  dataPointColor?: string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  spacing?: number;
  thickness?: number;
  color?: string;
  hideDataPoints?: boolean;
  dataPointsRadius?: number;
  noOfSections?: number;
  yAxisColor?: string;
  xAxisColor?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  spacing = 10,
  thickness = 2,
  color = '#2196F3',
  hideDataPoints = false,
  dataPointsRadius = 3,
  noOfSections = 4,
  yAxisColor = '#e5e7eb',
  xAxisColor = '#e5e7eb',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#9ca3af' }}>No data available</Text>
      </View>
    );
  }

  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Calculate max and min values
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  // Calculate step size for data points
  const stepX = chartWidth / (data.length - 1 || 1);

  // Generate points for the line
  const points = data.map((point, index) => {
    const x = padding + index * stepX;
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...point };
  }).filter(point => !isNaN(point.x) && !isNaN(point.y));

  // Create polyline points string
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Generate grid lines
  const gridLines = [];
  for (let i = 0; i <= noOfSections; i++) {
    const y = padding + (i / noOfSections) * chartHeight;
    gridLines.push(
      <Line
        key={`grid-${i}`}
        x1={padding}
        y1={y}
        x2={padding + chartWidth}
        y2={y}
        stroke={yAxisColor}
        strokeWidth={1}
        opacity={0.3}
      />
    );
  }

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {gridLines}

        {/* X-axis */}
        <Line
          x1={padding}
          y1={padding + chartHeight}
          x2={padding + chartWidth}
          y2={padding + chartHeight}
          stroke={xAxisColor}
          strokeWidth={1}
        />

        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + chartHeight}
          stroke={yAxisColor}
          strokeWidth={1}
        />

        {/* Main line */}
        {points.length > 1 && (
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {!hideDataPoints && points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={dataPointsRadius}
            fill={point.dataPointColor || color}
            stroke="white"
            strokeWidth={1}
          />
        ))}

        {/* X-axis labels */}
        {points.map((point, index) => {
          // Show every 5th label to avoid crowding
          if (index % 5 === 0 || index === points.length - 1) {
            return (
              <SvgText
                key={`label-${index}`}
                x={point.x}
                y={padding + chartHeight + 20}
                textAnchor="middle"
                fontSize={10}
                fill="#9ca3af"
              >
                {point.label}
              </SvgText>
            );
          }
          return null;
        })}

        {/* Y-axis labels */}
        {Array.from({ length: noOfSections + 1 }, (_, i) => {
          const value = minValue + (valueRange * i) / noOfSections;
          const y = padding + chartHeight - (i / noOfSections) * chartHeight;
          return (
            <SvgText
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 3}
              textAnchor="end"
              fontSize={10}
              fill="#9ca3af"
            >
              {Math.round(value * 100) / 100}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default LineChart;