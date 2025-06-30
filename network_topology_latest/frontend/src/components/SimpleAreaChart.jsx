import React, { useState } from 'react';

function formatFullDate(dateString) {
  const date = new Date(dateString);
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}:${month}:${day} ${hh}:${min}:${ss}`;
}

function formatTimeOnly(dateString) {
  const date = new Date(dateString);
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${min}:${ss}`;
}


function SimpleAreaChart({
  data,
  width = 950,
  height = 200,
  colors = { upload: '#82ca9d', download: '#f9b115' },
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0)
    return <p style={{ textAlign: 'center' }}>No data</p>;

  const allValues = data.flatMap((d) => [d.upload, d.download]);
  const maxValue = Math.max(...allValues);

  const margin = { top: 10, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xStep = chartWidth / (data.length - 1);
  const scaleY = (val) => chartHeight - (val / maxValue) * chartHeight;

  const pointsUpload = data
    .map(
      (d, i) =>
        `${margin.left + i * xStep},${margin.top + scaleY(d.upload)}`
    )
    .join(' ');

  const pointsDownload = data
    .map(
      (d, i) =>
        `${margin.left + i * xStep},${margin.top + scaleY(d.download)}`
    )
    .join(' ');

  const buildAreaPath = (points) => `
    M${points.split(' ')[0]}
    L${points} 
    L${margin.left + (data.length - 1) * xStep},${margin.top + chartHeight} 
    L${margin.left},${margin.top + chartHeight} Z
  `;

  const xLabels = data.map((d, i) => (
  <text
    key={i}
    x={margin.left + i * xStep}
    y={height - 5}
    textAnchor="middle"
    fontSize="10"
  >
    {formatTimeOnly(d.time)}
  </text>
));

  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const yVal = (maxValue / 5) * i;
    const yPos = margin.top + scaleY(yVal);
    yTicks.push(
      <g key={i}>
        <line
          x1={margin.left}
          y1={yPos}
          x2={width - margin.right}
          y2={yPos}
          stroke="#eee"
        />
        <text
          x={margin.left - 5}
          y={yPos + 4}
          textAnchor="end"
          fontSize="10"
        >
          {yVal.toFixed(0)}
        </text>
      </g>
    );
  }

  const tooltip =
    hoverIndex !== null &&
    (() => {
      const tooltipX = margin.left + hoverIndex * xStep;
      const tooltipWidth = 200;
      const padding = 10;

      const renderLeft = tooltipX + tooltipWidth + padding > width;
      const boxX = renderLeft
        ? tooltipX - tooltipWidth - padding
        : tooltipX + padding;
      const textX = boxX + 5;

      return (
        <g>
          <line
            x1={tooltipX}
            y1={margin.top}
            x2={tooltipX}
            y2={margin.top + chartHeight}
            stroke="#999"
            strokeDasharray="4"
          />
          <rect
            x={boxX}
            y={margin.top}
            width={tooltipWidth}
            height={60}
            fill="#fff"
            stroke="#ccc"
            rx="4"
            ry="4"
          />
          <text x={textX} y={margin.top + 15} fontSize="12" fill="#333" textAnchor="start">
            {formatFullDate(data[hoverIndex].time)}

          </text>
          <text
            x={textX}
            y={margin.top + 32}
            fontSize="12"
            fill={colors.upload}
          >
            Upload: {data[hoverIndex].upload}%
          </text>
          <text
            x={textX}
            y={margin.top + 48}
            fontSize="12"
            fill={colors.download}
          >
            Download: {data[hoverIndex].download}%
          </text>
        </g>
      );
    })();

  // Event Handlers
  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    let index = Math.round((x - margin.left) / xStep);
    if (index < 0) index = 0;
    if (index >= data.length) index = data.length - 1;
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <svg
      width={width}
      height={height}
      style={{ background: '#fff', border: '1px solid #ddd' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Y-axis ticks and lines */}
      {yTicks}

      {/* Area paths */}
      <path
        d={buildAreaPath(pointsUpload)}
        fill={colors.upload}
        fillOpacity="0.5"
        stroke={colors.upload}
        strokeWidth="2"
      />
      <path
        d={buildAreaPath(pointsDownload)}
        fill={colors.download}
        fillOpacity="0.5"
        stroke={colors.download}
        strokeWidth="2"
      />

      {/* X-axis labels */}
      {xLabels}

      {/* Tooltip */}
      {tooltip}
    </svg>
  );
}

export default SimpleAreaChart;
