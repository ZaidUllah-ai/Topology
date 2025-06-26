import React, { useState, createContext } from "react";
import axios, { baseUrl } from "../utils/axios";
import { data } from "../resources/STCDashboardv2";

export const Context = createContext();

const Index = (props) => {
  let topologyData = [];
  const [constants, setConstants] = useState(data);

  const getContext = () => {
    return {
      constants,
      topologyData,
    };
  };

  return (
    <Context.Provider value={getContext()}>{props.children}</Context.Provider>
  );
};

export default Index;
