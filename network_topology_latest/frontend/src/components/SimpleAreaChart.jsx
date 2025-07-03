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
  height = 220,
  colors = { upload: '#4fc3f7', download: '#ffb74d' },
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center' }}>No data</p>;
  }

  const allValues = data.flatMap((d) => [d.upload, d.download]);
  const maxValue = Math.max(...allValues, 10); // default min 10% scale

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xStep = chartWidth / (data.length - 1);
  const scaleY = (val) => chartHeight - (val / maxValue) * chartHeight;

  const pointsUpload = data
    .map((d, i) => `${margin.left + i * xStep},${margin.top + scaleY(d.upload)}`)
    .join(' ');

  const pointsDownload = data
    .map((d, i) => `${margin.left + i * xStep},${margin.top + scaleY(d.download) + 2}`) // slight offset
    .join(' ');

  const buildAreaPath = (points) => `
    M${points.split(' ')[0]}
    L${points}
    L${margin.left + (data.length - 1) * xStep},${margin.top + chartHeight}
    L${margin.left},${margin.top + chartHeight} Z
  `;

  // Show X-labels every 2nd point to reduce clutter
  const xLabels = data.map((d, i) => {
    if (i % 2 !== 0) return null;
    return (
      <text
        key={i}
        x={margin.left + i * xStep}
        y={height - 10}
        textAnchor="middle"
        fontSize="11"
        fill="#444"
      >
        {formatTimeOnly(d.time)}
      </text>
    );
  });

  // Y-axis grid lines and ticks
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
          stroke="#e0e0e0"
          strokeDasharray="4 4"
        />
        <text
          x={margin.left - 10}
          y={yPos + 4}
          textAnchor="end"
          fontSize="11"
          fill="#666"
        >
          {yVal.toFixed(0)}%
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
      const textX = boxX + 10;

      return (
        <g>
          <line
            x1={tooltipX}
            y1={margin.top}
            x2={tooltipX}
            y2={margin.top + chartHeight}
            stroke="#aaa"
            strokeDasharray="4"
          />
          <rect
            x={boxX}
            y={margin.top}
            width={tooltipWidth}
            height={65}
            fill="#ffffff"
            stroke="#bbb"
            rx="6"
            ry="6"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text x={textX} y={margin.top + 18} fontSize="12" fill="#333">
            {formatFullDate(data[hoverIndex].time)}
          </text>
          <text x={textX} y={margin.top + 36} fontSize="12" fill={colors.upload}>
            Upload: {data[hoverIndex].upload}%
          </text>
          <text x={textX} y={margin.top + 52} fontSize="12" fill={colors.download}>
            Download: {data[hoverIndex].download}%
          </text>
        </g>
      );
    })();

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    let index = Math.round((x - margin.left) / xStep);
    index = Math.max(0, Math.min(data.length - 1, index));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <svg
      width={width}
      height={height}
      style={{
        background: '#fafafa',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 10px 14px rgba(0,0,0,0.05)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid + Y Ticks */}
      {yTicks}

      {/* Upload Area */}
      <path
        d={buildAreaPath(pointsUpload)}
        fill={colors.upload}
        fillOpacity="0.25"
        stroke={colors.upload}
        strokeWidth="2.5"
      />

      {/* Download Area */}
      <path
        d={buildAreaPath(pointsDownload)}
        fill={colors.download}
        fillOpacity="0.25"
        stroke={colors.download}
        strokeWidth="2.5"
      />

      {/* X-axis Labels */}
      {xLabels}

      {/* Tooltip on hover */}
      {tooltip}
    </svg>
  );
}

export default SimpleAreaChart;
