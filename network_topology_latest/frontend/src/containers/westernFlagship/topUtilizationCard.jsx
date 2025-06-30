import React, { useContext } from "react";
import { Context } from "../../context";

const TopUtilizationCard = ({ data }) => {
  const { constants } = useContext(Context);

  return (
    <div
      style={{
        zIndex: "3",
        width: "30%",
        padding: "0.7%",
        float: "right",
        position: "absolute",
        bottom: "0",
        right: "0",
        clear: "right",
      }}
    >
      <div
        style={{
          zIndex: "3",
          borderRadius: "8px",
          border: " 1px solid white",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(0px)",
          padding: "4%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "13px",
            textAlign: "center",
            paddingBottom: "5px",
          }}
        >
          Top 5 Interface Utilizations
        </div>
        {data.map((element, index) => {
          let color = constants.utilization_threshold.critical_color;
          if (element?.percentage > 75 && element?.percentage < 90) {
            color = constants.utilization_threshold.major_color;
          } else if (element?.percentage > 0 && element?.percentage < 75) {
            color = constants.utilization_threshold.normal_color;
          } else {
            color = constants.utilization_threshold.zero_color;
          }
          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "white",
                padding: "5px",
                fontSize: "10px",
                fontWeight: "500",
              }}
            >
              <div>
                {index + 1}. {element?.deviceId} {"=>"}{" "}
                {element?.routerInterface}
              </div>
              <div>
                D-{element?.download_percentage}% - U-
                {element?.upload_percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopUtilizationCard;
