import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Menu = ({ route }) => {
  return (
    <div
      style={{
        zIndex: "3",
        float: "left",
        position: "absolute",
        padding: "1%",
        top: "0",
        left: "0",
        clear: "left",
      }}
    >
      <StyledLink
        active={route === "central"}
        to="/edn-topology-dashboard/central"
      >
        Central
      </StyledLink>{" "}
      &nbsp; &nbsp; &nbsp;
      <StyledLink
        active={route === "western"}
        to="/edn-topology-dashboard/western"
      >
        Western
      </StyledLink>{" "}
      &nbsp; &nbsp; &nbsp;
      <StyledLink
        active={route === "eastern"}
        to="/edn-topology-dashboard/eastern"
      >
        Eastern
      </StyledLink>
    </div>
  );
};

export const StyledLink = styled(Link)`
  color: ${(props) => (props.active ? "green" : "grey")};
  font-weight: ${(props) => (props.active ? "bolder" : "normal")};
`;

export default Menu;
