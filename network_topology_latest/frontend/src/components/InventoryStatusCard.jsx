import React from "react";

const InventoryStatusCard = ({ stats }) => {
  const { total_count = 0, up_count = 0, down_count = 0 } = stats || {};

  return (
    <div
      style={{
        zIndex: 3,
        width: "auto",
        position: "absolute",
        top: 0,
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
          padding: "12px 18px",
          boxSizing: "border-box",
          color: "white",
          fontSize: "14px",
        }}
      >
        <div style={{ fontWeight: "bold", textAlign: "center", marginBottom: "10px" }}>
          EDN Inventory
        </div>

        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontWeight: 500 }}>Total Devices: </span>{total_count}
        </div>
        <div style={{ marginBottom: "6px", color: "#6fdd6f" }}>
          <span style={{ fontWeight: 500 }}>Up Devices: </span>{up_count}
        </div>
        <div style={{ color: "#ff7b7b" }}>
          <span style={{ fontWeight: 500 }}>Down Devices: </span>{down_count}
        </div>
      </div>
    </div>
  );
};

export default InventoryStatusCard;
