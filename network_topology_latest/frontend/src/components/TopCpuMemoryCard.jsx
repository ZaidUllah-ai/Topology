import React from "react";

const TopCpuMemoryCard = ({ data }) => {
  const { topCpu, topMemory } = data;

  return (
    <div
      style={{
        zIndex: 3,
        width: "auto",
        position: "absolute",
        bottom: 0,
        left: 0,
        padding: "0.4%",
      }}
    >
      <div
        style={{
          borderRadius: "6px",
          border: "1px solid white",
          background: "rgba(0, 0, 0, 0.60)",
          backdropFilter: "blur(2px)",
          padding: "10px 15px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          <div style={{ flex: 1, textAlign: "center" }}>Top 5 CPU Utilization</div>
          <div style={{ flex: 1, textAlign: "center" }}>Top 5 Memory Utilization</div>
        </div>

        {/* Data Rows */}
        <div style={{ display: "flex" }}>
          {/* CPU Column */}
          <div style={{ flex: 1 }}>
            {topCpu.map((item, index) => (
              <div
                key={`cpu-${index}`}
                style={{
                  color: "white",
                  fontSize: "12px",
                  padding: "3px 0",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "6px"
                }}
              >
                {index + 1}. {item.device} ↔ {item.cpu_utilization}%
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "2px",
              backgroundColor: "rgba(255,255,255,0.3)",
              margin: "7px 10px",
            }}
          />

          {/* Memory Column */}
          <div style={{ flex: 1 }}>
            {topMemory.map((item, index) => (
              <div
                key={`mem-${index}`}
                style={{
                  color: "white",
                  fontSize: "12px",
                  padding: "3px 0",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "6px"
                }}
              >
                {index + 1}. {item.device} ↔ {item.memory_utilization}%
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopCpuMemoryCard;