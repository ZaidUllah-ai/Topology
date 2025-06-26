import React, { useEffect, useState, useCallback, useContext } from "react";
import axios, { baseUrlEastern } from "../../utils/axios/index";
import Logo from "./logo";
import Router from "../../resources/images/router.png";
import ReactFlow, { addEdge } from "reactflow";
import "reactflow/dist/style.css";
import Circle from "../../resources/images/Circle.svg";
import TopUtilizationCard from "./topUtilizationCard";
import Legend from "./legend";
import { Switch, Modal, Button } from "antd";
import { Context } from "../../context";
import Eastern from "../../resources/images/eastern.png";
import Cloud from "../../resources/images/cloud.png";
import SwitchIcon from "../../resources/images/switch.png";

const DEFAULT_WINDOW_WIDTH = 2100;
const DEFAULT_WINDOW_HEIGHT = 1180;
let toggleNodes = false;
let edgesVisibleG = true;
let secondaryEdgesVisibleG = true;

let routersData = {
  edges_list: [
    {
      bandwidth_utilization: 0.254,
      download: 23.77,
      high_speed: 10000.0,
      id: "edge-1",
      interface_a: "TenGigE0/0/0/12.922",
      interface_b: "be10.922",
      label: "0.254 %",
      source: "MPLS",
      target: "CF0016-EACC-CI-FS-RUH-001",
      upload: 1.64,
    },
    {
      bandwidth_utilization: 0.003,
      download: 0.02,
      high_speed: 1000,
      id: "edge-2",
      interface_a: "TenGigE0/0/0/12.916",
      interface_b: "Gi0/0/3.916",
      label: "0.003 %",
      source: "MPLS",
      target: "CF0016-EACC-CI-FS-RUH-002",
      upload: 0.01,
    },
    {
      bandwidth_utilization: 36.845,
      download: 3920.0,
      high_speed: 20000.0,
      id: "edge-3",
      interface_a: "Bundle-Ether22.900",
      interface_b: "Bundle-Ether22.900",
      label: "36.845 %",
      source: "MPLS",
      target: "CF0001-EDST-CI-FS-RUH-001",
      upload: 3448.98,
    },
    {
      bandwidth_utilization: 56.292,
      download: 2221.47,
      high_speed: 10000.0,
      id: "edge-4",
      interface_a: "TenGigE0/0/0/31.930",
      interface_b: "Te0/0/0/23.930",
      label: "56.292 %",
      source: "MPLS",
      target: "CF0003-EACC-CI-FS-RUH-001",
      upload: 3407.69,
    },
    {
      bandwidth_utilization: 0.0,
      download: 0.01,
      high_speed: 10000.0,
      id: "edge-5",
      interface_a: "TenGigE0/0/0/12.920",
      interface_b: "Te1/1/0.920",
      label: "0.0 %",
      source: "MPLS",
      target: "CF0006-EACC-CI-FS-RUH-001",
      upload: 0.01,
    },
    {
      bandwidth_utilization: 0.04,
      download: 0.3,
      high_speed: 1000,
      id: "edge-6",
      interface_a: "TenGigE0/0/0/12.914",
      interface_b: "Gi0/3/1.914",
      label: "0.04 %",
      source: "MPLS",
      target: "CF0007-EACC-CI-FS-HAS-001",
      upload: 0.1,
    },
    {
      bandwidth_utilization: 10.899,
      download: 80.61,
      high_speed: 1000,
      id: "edge-7",
      interface_a: "TenGigE0/0/0/12.908",
      interface_b: "Gi4/11.908",
      label: "10.899 %",
      source: "MPLS",
      target: "CF0008-EACC-CI-FS-BUR-001",
      upload: 28.38,
    },
    {
      bandwidth_utilization: 0.243,
      download: 2.22,
      high_speed: 1000,
      id: "edge-8",
      interface_a: "TenGigE0/0/0/12.910",
      interface_b: "Gi1/4.910",
      label: "0.243 %",
      source: "MPLS",
      target: "CF0009-EACC-CI-FS-RUH-001",
      upload: 0.21,
    },
    {
      bandwidth_utilization: 0.009,
      download: 1.43,
      high_speed: 20000.0,
      id: "edge-9",
      interface_a: " Bundle-Ether1000",
      interface_b: " Bundle-Ether1000",
      label: "0.009 %",
      source: "MPLS",
      target: "CF0011-EACC-CI-FS-UZH-001",
      type: "straight",
      upload: 0.27,
    },
    {
      bandwidth_utilization: 0.001,
      download: 0.03,
      high_speed: 10000.0,
      id: "edge-10",
      interface_a: "Te0/0/0/22.923",
      interface_b: "BE10.923",
      label: "0.001 %",
      source: "MPLS",
      target: "CF0013-EACC-CI-FS-RUH-001",
      upload: 0.03,
    },
    {
      bandwidth_utilization: 0.006,
      download: 0.03,
      high_speed: 1000,
      id: "edge-11",
      interface_a: "Te0/0/0/22.917",
      interface_b: "Gi0/0/3.917 ",
      label: "0.006 %",
      source: "MPLS",
      target: "CF0015-EACC-CI-FS-RUH-001",
      upload: 0.03,
    },
    {
      bandwidth_utilization: 34.65,
      download: 4280.75,
      high_speed: 20000.0,
      id: "edge-12",
      interface_a: "BE22.900",
      interface_b: "BE22.900",
      label: "34.65 %",
      source: "MPLS",
      target: "CF0015-EACC-CI-FS-RUH-002",
      upload: 2649.18,
    },
    {
      bandwidth_utilization: 0.001,
      download: 0.03,
      high_speed: 10000.0,
      id: "edge-13",
      interface_a: "Te0/0/0/31.931",
      interface_b: "Te0/0/0/23.931",
      label: "0.001 %",
      source: "MPLS",
      target: "CF0033-EACC-CI-FS-RUH-001",
      upload: 0.03,
    },
    {
      bandwidth_utilization: 0.001,
      download: 0.03,
      high_speed: 10000.0,
      id: "edge-14",
      interface_a: "Te0/0/0/22.921",
      interface_b: "Te1/1/0.921",
      label: "0.001 %",
      source: "MPLS",
      target: "CF0033-EACC-CI-FS-RUH-002",
      upload: 0.03,
    },
    {
      bandwidth_utilization: 0,
      download: 0,
      high_speed: 0,
      id: "edge-15",
      interface_a: "Te0/0/0/22.915",
      interface_b: "Gi0/3/1.915",
      label: "0.0 %",
      source: "MPLS",
      target: "MLQA-ECOR-CI-EXC-001",
      upload: 0,
    },
    {
      bandwidth_utilization: 0.007,
      download: 0.03,
      high_speed: 1000,
      id: "edge-16",
      interface_a: "Te0/0/0/22.909",
      interface_b: "Gi4/11.909",
      label: "0.007 %",
      source: "MPLS",
      target: "SULM-ECOR-CI-EXC-001",
      upload: 0.04,
    },
  ],

  node_list: [
    {
      device: "MPLS",
      id: "MPLS",
      icon: "Switch",
      location: "inner",
      position: {
        x: 980.0,
        y: 550.0,
      },
    },
    {
      device: "CF0016-EACC-CI-FS-RUH-001",
      id: "CF0016-EACC-CI-FS-RUH-001",
      ip: "10.228.225.209",
      site_id: "CF0016",
      region: "CENTRAL",
      interface: "GigabitEthernet1/0/48",
      icon: "Switch",
      location: "outer",
      position: {
        x: 200.0,
        y: 350.0,
      },
    },
    {
      device: "CF0016-EACC-CI-FS-RUH-002",
      id: "CF0016-EACC-CI-FS-RUH-002",
      ip: "10.228.236.90",
      site_id: "CF0016",
      region: "CENTRAL",
      interface: "GigabitEthernet1/0/48",
      icon: "Switch",
      location: "outer",
      position: {
        x: 280.0,
        y: 150.0,
      },
    },
    {
      device: "CF0001-EDST-CI-FS-RUH-001",
      id: "CF0001-EDST-CI-FS-RUH-001",
      ip: "10.2.55.1",
      site_id: "CF0001",
      region: "CENTRAL",
      interface: "GigabitEthernet2/1/3",
      icon: "Switch",
      location: "outer",
      position: {
        x: 600.0,
        y: 150.0,
      },
    },
    {
      device: "CF0003-EACC-CI-FS-RUH-001",
      id: "CF0003-EACC-CI-FS-RUH-001",
      ip: "10.2.78.1",
      site_id: "CF0003",
      region: "CENTRAL",
      interface_a: "GigabitEthernet1/1/2",
      icon: "Switch",
      location: "outer",
      position: {
        x: 850.0,
        y: 150.0,
      },
    },
    {
      device: "CF0006-EACC-CI-FS-RUH-001",
      id: "CF0006-EACC-CI-FS-RUH-001",
      ip: "10.2.15.64",
      site_id: "CF0006",
      region: "CENTRAL",
      interface: "GigabitEthernet2/0/48",
      interface2: "GigabitEthernet1/0/48",
      icon: "Switch",
      location: "outer",
      position: {
        x: 1800.0,
        y: 350.0,
      },
    },
    {
      device: "CF0011-EACC-CI-FS-UZH-001",
      id: "CF0011-EACC-CI-FS-UZH-001",
      ip: "10.9.135.200",
      site_id: "CF0011",
      region: "CENTRAL",
      interface: "GigabitEthernet1/0/1",
      interface2: "GigabitEthernet1/0/47",
      icon: "Switch",
      location: "outer",
      position: {
        x: 1150.0,
        y: 150.0,
      },
    },
    {
      device: "CF0008-EACC-CI-FS-BUR-001",
      id: "CF0008-EACC-CI-FS-BUR-001",
      ip: "10.9.131.247",
      site_id: "CF0008",
      region: "CENTRAL",
      interface: "GigabitEthernet1/0/48",
      icon: "Switch",
      location: "outer",
      position: {
        x: 1350.0,
        y: 150.0,
      },
    },
    {
      device: "CF0009-EACC-CI-FS-RUH-001",
      id: "CF0009-EACC-CI-FS-RUH-001",
      ip: "10.2.65.208",
      site_id: "CF0009",
      region: "CENTRAL",
      interface: "GigabitEthernet1/1/1",
      icon: "Switch",
      location: "outer",
      position: {
        x: 1570.0,
        y: 150.0,
      },
    },
    {
      device: "CF0007-EACC-CI-FS-HAS-001",
      id: "CF0007-EACC-CI-FS-HAS-001",
      ip: "10.10.138.2",
      site_id: "CF0007",
      region: "CENTRAL",
      interface: "GigabitEthernet1/0/24",
      interface2: "GigabitEthernet2/0/24",
      icon: "Switch",
      location: "outer",
      position: {
        x: 1800.0,
        y: 150.0,
      },
    },
    // {
    //   device: "CF0013-EACC-CI-FS-RUH-001",
    //   id: "CF0013-EACC-CI-FS-RUH-001",
    //   ip: "10.228.225.19",
    //   site_id: "CF0013",
    //   region: "CENTRAL",
    //   interface: "GigabitEthernet1/0/24",
    //   interface2: "GigabitEthernet2/0/23",
    //   icon: "Switch",
    //   location: "outer",
    //   position: {
    //     x: 100.0,
    //     y: 400.0,
    //   },
    // },
    // {
    //   device: "CF0015-EACC-CI-FS-RUH-001",
    //   id: "CF0015-EACC-CI-FS-RUH-001",
    //   ip: "10.228.236.86",
    //   site_id: "CF0015",
    //   region: "CENTRAL",
    //   interface: "FastEthernet1/0/1",
    //   icon: "Switch",
    //   location: "outer",
    //   position: {
    //     x: 100.0,
    //     y: 670.0,
    //   },
    // },
    // {
    //   device: "CF0015-EACC-CI-FS-RUH-002",
    //   id: "CF0015-EACC-CI-FS-RUH-002",
    //   ip: "10.228.236.84",
    //   site_id: "CF0015",
    //   region: "CENTRAL",
    //   interface: "FastEthernet1/0/1",
    //   icon: "Switch",
    //   location: "outer",
    //   position: {
    //     x: 100.0,
    //     y: 750.0,
    //   },
    // },
    // {
    //   device: "CF0033-EACC-CI-FS-RUH-001",
    //   id: "CF0033-EACC-CI-FS-RUH-001",
    //   ip: "10.12.118.224",
    //   site_id: "CF0033",
    //   region: "CENTRAL",
    //   interface: "GigabitEthernet1/0/24",
    //   icon: "Switch",
    //   location: "outer",
    //   position: {
    //     x: 1800,
    //     y: 370,
    //   },
    // },
    // {
    //   device: "CF0033-EACC-CI-FS-RUH-002",
    //   id: "CF0033-EACC-CI-FS-RUH-002",
    //   ip: "10.12.118.225",
    //   site_id: "CF0033",
    //   region: "CENTRAL",
    //   interface: "GigabitEthernet1/0/24",
    //   icon: "Switch",
    //   location: "outer",
    //   position: {
    //     x: 1800,
    //     y: 450,
    //   },
    // },
    {
      device: "MLQA-ECOR-CI-EXC-001",
      id: "MLQA-ECOR-CI-EXC-001",
      ip: "10.64.0.21",
      site_id: "MLQA",
      region: "CENTRAL",
      interface: "TenGigabitEthernet2/1",
      icon: "Router",
      location: "outer",
      position: {
        x: 500,
        y: 900,
      },
    },
    {
      device: "SULM-ECOR-CI-EXC-001",
      id: "SULM-ECOR-CI-EXC-001",
      ip: "10.66.0.21",
      site_id: "SULM",
      region: "CENTRAL",
      interface: "Te0/0/0/23",
      icon: "Router",
      location: "outer",
      position: {
        x: 1500,
        y: 900,
      },
    },
  ],
};

export function convertJSONToString(jsonData) {
  return JSON.stringify(jsonData);
}

export function convertStringToObject(stringData) {
  return JSON.parse(stringData);
}

let frontendEdges = null;

function Index(props) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  function calculateNewPosition(nodeX, nodeY) {
    const ratioX = windowSize.width / DEFAULT_WINDOW_WIDTH;
    const ratioY = windowSize.height / DEFAULT_WINDOW_HEIGHT;

    const newNodeX = nodeX * ratioX;
    const newNodeY = nodeY * ratioY;

    return { x: newNodeX, y: newNodeY };
  }

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [topUtils, setTopUtils] = useState([]);
  const [showCards, setShowCards] = useState(true);
  const [visible, setVisible] = useState(false);
  const [edgesVisible, setEdgesVisible] = useState(true);
  const [secondaryEdgesVisible, setSecondaryEdgesVisible] = useState(true);
  const [selectedEdgeData, setSelectedEdgeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleResize = () => {
    console.log({ width: window.innerWidth, height: window.innerHeight });
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(handleApis, 5 * 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    localStorage.removeItem("edges_list");
    // handleData();
    axios
      .get(`${baseUrlEastern}/topInterfaceUtilization`)
      .then((response) => {
        setTopUtils(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios
      .get(`${baseUrlEastern}/get-router`)
      .then((response) => {
        setLoading(false);
        localStorage.setItem(
          "edges_list",
          JSON.stringify(response.data.edges_list)
        );
        let node_list = response.data.node_list;
        for (let i = 0; i < node_list.length; i++) {
          node_list[i]["data"] = {
            label: (
              <div style={{ border: "0px solid red", padding: "0" }}>
                <img
                  src={node_list[i].icon === "Switch" ? SwitchIcon : Router}
                  alt="Grid"
                  width={node_list[i].icon === "Router" ? 60 : 30}
                  style={{
                    padding: "0",
                    marginBottom: "-5px",
                    marginTop: "5px",
                  }}
                />

                <p
                  style={{
                    fontSize: "7px",
                    color: "black",
                    transform: "rotate(30deg)",
                  }}
                >
                  {node_list[i].id}
                </p>
              </div>
            ),
          };
          node_list[i]["style"] = {
            backgroundColor: "transparent",
            border: 0,
            padding: 0,
            width: 100,
          };
          node_list[i]["position"] = calculateNewPosition(
            node_list[i]["position"].x,
            node_list[i]["position"].y
          );
        }
        setNodes(node_list);
        let edges_list = response.data.edges_list;
        for (let i = 0; i < edges_list.length; i++) {
          if (edges_list[i]["bandwidth_utilization"] >= 80) {
            edges_list[i]["style"] = {
              stroke: "#dc3545",
              strokeWidth: 1,
            };
          } else if (edges_list[i]["bandwidth_utilization"] >= 50) {
            edges_list[i]["style"] = {
              stroke: "#ff8d41",
              strokeWidth: 1,
            };
          } else if (edges_list[i]["bandwidth_utilization"] > 0) {
            edges_list[i]["style"] = {
              stroke: "#038d03",
              strokeWidth: 1,
            };
          } else {
            edges_list[i]["style"] = {
              stroke: "#645e5e",
              strokeWidth: 1,
            };
          }
          edges_list[i].label = "";
        }

        frontendEdges = edges_list;
        setEdges(edges_list);
        localStorage.setItem("node", convertJSONToString(node_list));
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching data: ", error);
      });
  }, []);

  // const handleData = () => {
  //   localStorage.setItem("edges_list", JSON.stringify(routersData.edges_list));
  //   let node_list = routersData.node_list;
  //   for (let i = 0; i < node_list.length; i++) {
  //     node_list[i]["data"] = {
  //       label: (
  //         <div style={{ border: "0px solid red", padding: "0" }}>
  //           <img
  //             src={node_list[i].icon === "Switch" ? SwitchIcon : Router}
  //             alt="Grid"
  //             width={node_list[i].icon === "Router" ? 60 : 30}
  //             style={{
  //               padding: "0",
  //               marginBottom: "-5px",
  //               marginTop: "5px",
  //             }}
  //           />

  //           <p
  //             style={{
  //               fontSize: "7px",
  //               color: "black",
  //               transform: "rotate(30deg)",
  //             }}
  //           >
  //             {node_list[i].id}
  //           </p>
  //         </div>
  //       ),
  //     };
  //     node_list[i]["style"] = {
  //       backgroundColor: "transparent",
  //       border: 0,
  //       padding: 0,
  //       width: 100,
  //     };
  //     node_list[i]["position"] = calculateNewPosition(
  //       node_list[i]["position"].x,
  //       node_list[i]["position"].y
  //     );
  //   }
  //   setNodes(node_list);
  //   let edges_list = routersData.edges_list;
  //   for (let i = 0; i < edges_list.length; i++) {
  //     if (edges_list[i]["bandwidth_utilization"] >= 80) {
  //       edges_list[i]["style"] = {
  //         stroke: "#dc3545",
  //         strokeWidth: 1,
  //       };
  //     } else if (edges_list[i]["bandwidth_utilization"] >= 50) {
  //       edges_list[i]["style"] = {
  //         stroke: "#ff8d41",
  //         strokeWidth: 1,
  //       };
  //     } else if (edges_list[i]["bandwidth_utilization"] > 0) {
  //       edges_list[i]["style"] = {
  //         stroke: "#038d03",
  //         strokeWidth: 1,
  //       };
  //     } else {
  //       edges_list[i]["style"] = {
  //         stroke: "#645e5e",
  //         strokeWidth: 1,
  //       };
  //     }
  //     edges_list[i].label = "";
  //   }

  //   frontendEdges = edges_list;
  //   setEdges(edges_list);
  //   localStorage.setItem("node", convertJSONToString(node_list));
  // };

  const handleApis = () => {
    setLoading(true);
    setVisible(false);
    axios
      .get(`${baseUrlEastern}/topInterfaceUtilization`)
      .then((response) => {
        setTopUtils(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios
      .get(`${baseUrlEastern}/get-router`)
      .then((response) => {
        setLoading(false);
        localStorage.setItem(
          "edges_list",
          JSON.stringify(response.data.edges_list)
        );
        let node_list = response.data.node_list;
        for (let i = 0; i < node_list.length; i++) {
          node_list[i]["data"] = {
            label: (
              <div style={{ border: "0px solid red", padding: "0" }}>
                <img
                  src={node_list[i].icon === "Switch" ? SwitchIcon : Router}
                  alt="Grid"
                  width={node_list[i].icon === "Router" ? 60 : 30}
                  style={{
                    padding: "0",
                    marginBottom: "-5px",
                    marginTop: "5px",
                  }}
                />
                <p
                  style={{
                    fontSize: "7px",
                    color: "black",
                    transform: "rotate(30deg)",
                  }}
                >
                  {node_list[i].id}
                </p>
              </div>
            ),
          };
          node_list[i]["style"] = {
            backgroundColor: "transparent",
            border: 0,
            padding: 0,
            width: 100,
          };
          node_list[i]["position"] = calculateNewPosition(
            node_list[i]["position"].x,
            node_list[i]["position"].y
          );
        }

        let edges_list = response.data.edges_list;
        for (let i = 0; i < edges_list.length; i++) {
          if (edges_list[i]["bandwidth_utilization"] >= 80) {
            edges_list[i]["style"] = {
              stroke: "#dc3545",
              strokeWidth: 1,
            };
          } else if (edges_list[i]["bandwidth_utilization"] >= 50) {
            edges_list[i]["style"] = {
              stroke: "#ff8d41",
              strokeWidth: 1,
            };
          } else if (edges_list[i]["bandwidth_utilization"] > 0) {
            edges_list[i]["style"] = {
              stroke: "#038d03",
              strokeWidth: 1,
            };
          } else {
            edges_list[i]["style"] = {
              stroke: "#645e5e",
              strokeWidth: 1,
            };
          }
          edges_list[i].label = "";
        }

        localStorage.setItem("node", convertJSONToString(node_list));

        if (edgesVisibleG === false && secondaryEdgesVisibleG === false) {
          console.log("ff");
          toggleEdgesHandlerAfterRefresh(edgesVisibleG, node_list, edges_list);
        } else if (edgesVisibleG === true && secondaryEdgesVisibleG === false) {
          console.log("tf");
          toggleSecondaryEdgesAfterRefresh(secondaryEdgesVisibleG, edges_list);
        } else if (edgesVisibleG === false && secondaryEdgesVisibleG === true) {
          console.log("ft");
          let tempEdges = toggleEdgesHandlerAfterRefresh(
            edgesVisibleG,
            node_list,
            edges_list,
            false
          );
          toggleSecondaryEdgesAfterRefresh(secondaryEdgesVisibleG, tempEdges);
        } else {
          console.log("tt");
          frontendEdges = edges_list;
          setEdges(edges_list);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching data: ", error);
      });
  };

  const toggleEdgesHandlerAfterRefresh = (
    visible,
    nodes,
    edges,
    isSetEdges = true
  ) => {
    let hidden = !visible;
    let inners = nodes?.reduce((innerIds, node) => {
      if (node.location === "inner" || node.icon === "Router") {
        innerIds.push(node.id);
        return innerIds;
      }
      return innerIds;
    }, []);

    let updatedEdges = edges?.map((edge) => {
      if (!(inners.includes(edge.target) && inners.includes(edge.source))) {
        return {
          ...edge,
          hidden,
        };
      } else {
        return {
          ...edge,
          hidden: false,
        };
      }
    });

    if (isSetEdges) {
      frontendEdges = updatedEdges;
      setEdges(updatedEdges);
    }
    return updatedEdges;
  };

  const toggleSecondaryEdgesAfterRefresh = (visible, edges) => {
    let hidden = !visible;
    let updatedEdges = edges?.map((edge) => {
      if (edge.target.charAt(edge.target.length - 1) == "2") {
        return {
          ...edge,
          hidden,
        };
      }
      return edge;
    });

    frontendEdges = updatedEdges;
    setEdges(updatedEdges);
  };

  const toggleEdgesHandler = (hidden) => {
    setEdgesVisible(!hidden);
    edgesVisibleG = !hidden;
    let inners = nodes?.reduce((innerIds, node) => {
      if (node.location === "inner" || node.icon === "Router") {
        innerIds.push(node.id);
        return innerIds;
      }
      return innerIds;
    }, []);

    let updatedEdges = edges?.map((edge) => {
      if (!(inners.includes(edge.target) && inners.includes(edge.source))) {
        return {
          ...edge,
          hidden,
        };
      } else {
        return {
          ...edge,
          hidden: false,
        };
      }
    });
    setSecondaryEdgesVisible(!hidden);
    secondaryEdgesVisibleG = !hidden;
    frontendEdges = updatedEdges;
    setEdges(updatedEdges);
  };

  const toggleSecondaryEdges = (hidden) => {
    setSecondaryEdgesVisible(!hidden);
    secondaryEdgesVisibleG = !hidden;
    let updatedEdges = edges?.map((edge) => {
      if (edge.target.charAt(edge.target.length - 1) == "2") {
        return {
          ...edge,
          hidden,
        };
      }
      return edge;
    });

    frontendEdges = updatedEdges;
    setEdges(updatedEdges);
  };

  const toggleNodesHandler = (hidden) => {
    let updatedNodes = nodes?.map((node) => {
      return {
        ...node,
        hidden,
      };
    });
    setNodes(updatedNodes);
    toggleNodes = hidden;
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const [node_selected, set_node_selected] = useState(null);
  const handleNodeClick = (event, node) => {
    if (node_selected === node.id) {
      set_node_selected(null);
      let updatedEdges = edges?.map((edge) => {
        return {
          ...edge,
          hidden: false,
        };
      });
      frontendEdges = updatedEdges;
      setEdges(updatedEdges);
    } else {
      set_node_selected(node.id);
      let updatedEdges = edges?.map((edge) => {
        if (edge.source === node.id || edge.target === node.id) {
          return {
            ...edge,
            hidden: false,
          };
        } else {
          return {
            ...edge,
            hidden: true,
          };
        }
      });

      frontendEdges = updatedEdges;
      setEdges(updatedEdges);
    }
  };

  const handleEdgeClick = (event, edge) => {
    showModal(edge);
  };

  const showModal = (data) => {
    setSelectedEdgeData(data);
    setVisible(true);
  };

  const handleOk = () => {
    setVisible(false);
    setSelectedEdgeData(null);
  };

  const handleOnEdgeMouseEnter = (event, edge) => {
    let edgesString = localStorage.getItem("edges_list");
    let edgeData = [];
    if (edgesString) {
      edgeData = JSON.parse(edgesString);
    }

    let edgeFound = edgeData?.find((item) => item.id === edge.id);
    console.log("$$$$", edgeFound);
    let updatedEdges = frontendEdges?.map((item) => {
      if (item.id === edge.id) {
        return {
          ...item,
          label: edgeFound?.label,
        };
      }
      return item;
    });

    setEdges(updatedEdges);
  };

  const handleOnEdgeMouseLeave = (event, edge) => {
    let edgesString = localStorage.getItem("edges_list");
    let edgeData = [];
    if (edgesString) {
      edgeData = JSON.parse(edgesString);
    }

    let updatedEdges = frontendEdges?.map((item) => {
      if (item.id === edge.id) {
        return {
          ...item,
          label: "",
        };
      }
      return item;
    });

    setEdges(updatedEdges);
  };

  return (
    <div
      style={{
        height: "100vh",
        // width: "100%",
        // overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {visible ? (
        <Modal
          title="Edge Details"
          visible={visible}
          onOk={handleOk}
          onCancel={null}
          footer={[
            <Button key="ok" type="primary" onClick={handleOk}>
              OK
            </Button>,
          ]}
        >
          {/* <p>Id: {selectedEdgeData?.id}</p> */}
          <p>Source: {selectedEdgeData?.source}</p>
          {/* <p>Source Interface: {selectedEdgeData?.interface_a}</p> */}
          <p>Target: {selectedEdgeData?.target}</p>
          <p>Interface A: {selectedEdgeData?.interface_b}</p>
          <p>Interface B: {selectedEdgeData?.interface_b}</p>
          <p>Download: {selectedEdgeData?.download} mb</p>
          <p>Upload: {selectedEdgeData?.upload} mb</p>
          <p>Link Capacity: {selectedEdgeData?.high_speed} mb</p>
          <p>
            Bandwidth Utilization: {selectedEdgeData?.bandwidth_utilization} %
          </p>
        </Modal>
      ) : null}
      <h2
        style={{
          position: "absolute",
          zIndex: "1",
          right: "-65px",
          transform: "rotate(-90deg)",
        }}
      >
        Eastern Flagship Topology
      </h2>
      <div>
        <div
          style={{
            position: "absolute",
            zIndex: "99999",
            marginTop: "80px",
            marginRight: "10px",
            top: "0",
            right: "0",
            color: "grey",
            fontSize: "13px",
            fontWeight: "bolder",
          }}
        >
          Edges
        </div>
        <Switch
          size="small"
          style={{
            position: "absolute",
            zIndex: "99999",
            marginTop: "100px",
            marginRight: "10px",
            top: "0",
            right: "0",
            width: "40px",
          }}
          checked={edgesVisible}
          onChange={(bool) => toggleEdgesHandler(!bool)}
        />
      </div>

      <div>
        <div
          style={{
            position: "absolute",
            zIndex: "99999",
            marginTop: "120px",
            marginRight: "10px",
            top: "0",
            right: "0",
            color: "grey",
            fontSize: "13px",
            fontWeight: "bolder",
          }}
        >
          Cards
        </div>
        <Switch
          size="small"
          style={{
            position: "absolute",
            zIndex: "99999",
            marginTop: "140px",
            marginRight: "10px",
            top: "0",
            right: "0",
            width: "40px",
          }}
          defaultChecked
          onChange={(bool) => setShowCards(bool)}
        />
      </div>

      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100px",
          height: "100px",
          zIndex: "999",
        }}
      >
        <img src={Cloud} alt="Cloud" />
      </div>
      <div
        className="app"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          className="full-screen-image"
          src={Eastern}
          alt="Your Image"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      {/* </div> */}
      {nodes.length !== 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onPaneScroll={(e) => {}}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          minZoom={1}
          maxZoom={1}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onEdgeMouseEnter={handleOnEdgeMouseEnter}
          onEdgeMouseLeave={handleOnEdgeMouseLeave}
        />
      )}

      <Logo />
      {showCards ? (
        <>
          <Legend />
          <TopUtilizationCard data={topUtils} />
        </>
      ) : null}
    </div>
  );
}

export default Index;
