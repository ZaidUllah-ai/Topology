import React from "react";
import cisco from "../../resources/images/cisco.png";

const Logo = (props) => {
  return (
    <div
      style={{
        zIndex: "3",
        float: "right",
        position: "absolute",
        padding: "1%",
        top: "0",
        right: "0",
        clear: "right",
      }}
    >
      <img src={cisco} width="100px" />
    </div>
  );
};

export default Logo;
