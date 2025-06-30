import React, { useContext } from "react";
import { Context } from "../../context";

const Index = ({ data }) => {
  const { constants } = useContext(Context);

  return (
    <div
      style={{
        zIndex: "3",
        width: "20%",
        padding: "0.7%",
        float: "right",
        position: "absolute",
        bottom: "0",
        right: "10",
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
          height: "150px",
          overflowY: "scroll",
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
          Down Flagships
        </div>
        {data.map((element, index) => {
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
                {index + 1}. {element}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Index;
