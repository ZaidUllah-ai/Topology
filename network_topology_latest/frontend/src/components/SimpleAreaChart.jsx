import React, { useState } from 'react';

function SimpleAreaChart({ data, width = 800, height = 200, colors = { upload: '#82ca9d', download: '#f9b115' } }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) return <p>No data</p>;

  const allValues = data.flatMap(d => [d.upload, d.download]);
  const maxValue = Math.max(...allValues);

  const margin = { top: 10, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xStep = chartWidth / (data.length - 1);
  const scaleY = val => chartHeight - (val / maxValue) * chartHeight;

  const pointsUpload = data.map((d, i) => `${margin.left + i * xStep},${margin.top + scaleY(d.upload)}`).join(' ');
  const pointsDownload = data.map((d, i) => `${margin.left + i * xStep},${margin.top + scaleY(d.download)}`).join(' ');

  const buildAreaPath = (points) => `
    M${points.split(' ')[0]} 
    L${points} 
    L${margin.left + (data.length - 1) * xStep},${margin.top + chartHeight} 
    L${margin.left},${margin.top + chartHeight} Z
  `;

  const xLabels = data.map((d, i) => (
    <text key={i} x={margin.left + i * xStep} y={height - 5} textAnchor="middle" fontSize="10">
      {d.time}
    </text>
  ));

  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const yVal = (maxValue / 5) * i;
    const yPos = margin.top + scaleY(yVal);
    yTicks.push(
      <g key={i}>
        <line x1={margin.left} y1={yPos} x2={width - margin.right} y2={yPos} stroke="#eee" />
        <text x={margin.left - 5} y={yPos + 4} textAnchor="end" fontSize="10">{yVal.toFixed(0)}</text>
      </g>
    );
  }

  const tooltip = hoverIndex !== null && (
    <g>
      {/* Vertical line */}
      <line
        x1={margin.left + hoverIndex * xStep}
        y1={margin.top}
        x2={margin.left + hoverIndex * xStep}
        y2={margin.top + chartHeight}
        stroke="#999"
        strokeDasharray="4"
      />
      {/* Tooltip box */}
      <rect
        x={margin.left + hoverIndex * xStep + 10}
        y={margin.top}
        width="120"
        height="60"
        fill="#fff"
        stroke="#ccc"
        rx="4"
        ry="4"
      />
      <text x={margin.left + hoverIndex * xStep + 15} y={margin.top + 15} fontSize="12" fill="#333">
        Time: {data[hoverIndex].time}
      </text>
      <text x={margin.left + hoverIndex * xStep + 15} y={margin.top + 32} fontSize="12" fill={colors.upload}>
        Upload: {data[hoverIndex].upload}%
      </text>
      <text x={margin.left + hoverIndex * xStep + 15} y={margin.top + 48} fontSize="12" fill={colors.download}>
        Download: {data[hoverIndex].download}%
      </text>
    </g>
  );

  const dots = data.map((d, i) => (
    <circle
      key={i}
      cx={margin.left + i * xStep}
      cy={margin.top + scaleY(d.upload)}
      r={4}
      fill={colors.upload}
      opacity={hoverIndex === i ? 1 : 0.4}
      onMouseEnter={() => setHoverIndex(i)}
      onMouseLeave={() => setHoverIndex(null)}
      style={{ cursor: 'pointer' }}
    />
  ));

  return (
    <svg width={width} height={height} style={{ background: '#fff', border: '1px solid #ddd' }}>
      {yTicks}

      {/* Upload Area */}
      <path d={buildAreaPath(pointsUpload)} fill={colors.upload} fillOpacity="0.5" stroke={colors.upload} strokeWidth="2" />

      {/* Download Area */}
      <path d={buildAreaPath(pointsDownload)} fill={colors.download} fillOpacity="0.5" stroke={colors.download} strokeWidth="2" />

      {/* X axis labels */}
      {xLabels}

      {/* Dots + Tooltip */}
      {dots}
      {tooltip}
    </svg>
  );
}

export default SimpleAreaChart;
