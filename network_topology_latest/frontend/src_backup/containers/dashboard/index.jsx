import React, { useEffect, useState, useCallback, useContext } from "react";
import axios, { baseUrl } from "../../utils/axios/index";
import Logo from "./logo";
import OrangeSwitchIcon from "../../resources/images/orangeSwitch.png";
import OrangeRouterIcon from "../../resources/images/orangeRouter.png";
import Router from "../../resources/images/router.png";
import ReactFlow, { addEdge } from "reactflow";
import "reactflow/dist/style.css";
import Circle from "../../resources/images/Circle.png";
import TopUtilizationCard from "./topUtilizationCard";
import Legend from "./legend";
import { Switch, Modal, Button } from "antd";
import CustomNode from "./customNode";
import { Context } from "../../context";

const DEFAULT_WINDOW_WIDTH = 2100;
const DEFAULT_WINDOW_HEIGHT = 1180;
let toggleNodes = false;
let edgesVisibleG = true;
let secondaryEdgesVisibleG = true;
let nodeSelectedG = null;

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
  const [nodeSelected, setNodeSelected] = useState(null);
  const [nodeDataSelected, setNodeDataSelected] = useState(null);

  const nodeTypes = { customNode: CustomNode };
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
      localStorage.removeItem("edges_list_dashboard");
      localStorage.removeItem("node_dashboard");
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    document.title = "EDN WAN Topology";
    axios
      .get(`${baseUrl}/topInterfaceUtilizations`)
      .then((response) => {
        setTopUtils(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios
      .get(`${baseUrl}/get-routers`)
      .then((response) => {
        localStorage.setItem(
          "edges_list_dashboard",
          JSON.stringify(response.data.edges_list)
        );
        let node_list = response.data.node_list;

        let tempEdges = response.data.edges_list;
        const targetCounts = {};
        for (const edge of tempEdges) {
          const { target } = edge;
          if (target in targetCounts) {
            targetCounts[target] += 1;
          } else {
            targetCounts[target] = 1;
          }
        }

        for (let i = 0; i < node_list.length; i++) {
          node_list[i]["data"] = {
            label: (
              <div style={{ border: "0px solid red", padding: "0" }}>
                <img
                  src={
                    node_list[i].cpu_utilization > 70 ||
                    node_list[i].memory_utilization > 70
                      ? OrangeRouterIcon
                      : Router
                  }
                  alt="Grid"
                  width={node_list[i].location === "inner" ? 30 : 20}
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
            id: node_list[i].id,
            count: targetCounts[node_list[i].id],
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
          // node_list[i]["type"] = "customNode";
        }
        setNodes(node_list);
        let edges_list = response.data.edges_list;
        for (let i = 0; i < edges_list.length; i++) {
          let higherUtilization = Math.max(
            edges_list[i]["upload_utilization"],
            edges_list[i]["download_utilization"]
          );

          if (higherUtilization >= 80) {
            edges_list[i]["style"] = {
              stroke: "#dc3545",
              strokeWidth: 1,
            };
          } else if (higherUtilization >= 50) {
            edges_list[i]["style"] = {
              stroke: "#ff8d41",
              strokeWidth: 1,
            };
          } else if (higherUtilization > 0) {
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
        localStorage.setItem("node_dashboard", convertJSONToString(node_list));
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleApis = () => {
    setEdges([]);
    setVisible(false);
    axios
      .get(`${baseUrl}/topInterfaceUtilizations`)
      .then((response) => {
        setTopUtils(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios
      .get(`${baseUrl}/get-routers`)
      .then((response) => {
        localStorage.setItem(
          "edges_list_dashboard",
          JSON.stringify(response.data.edges_list)
        );
        let node_list = response.data.node_list;

        let tempEdges = response.data.edges_list;
        const targetCounts = {};
        for (const edge of tempEdges) {
          const { target } = edge;
          if (target in targetCounts) {
            targetCounts[target] += 1;
          } else {
            targetCounts[target] = 1;
          }
        }

        for (let i = 0; i < node_list.length; i++) {
          node_list[i]["data"] = {
            label: (
              <div style={{ border: "0px solid red", padding: "0" }}>
                <img
                  src={
                    node_list[i].cpu_utilization > 70 ||
                    node_list[i].memory_utilization > 70
                      ? OrangeRouterIcon
                      : Router
                  }
                  alt="Grid"
                  width={node_list[i].location === "inner" ? 30 : 20}
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
            id: node_list[i].id,
            count: targetCounts[node_list[i].id],
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
          // node_list[i]["type"] = "customNode";
        }

        let edges_list = response.data.edges_list;
        for (let i = 0; i < edges_list.length; i++) {
          let higherUtilization = Math.max(
            edges_list[i]["upload_utilization"],
            edges_list[i]["download_utilization"]
          );
          if (higherUtilization >= 80) {
            edges_list[i]["style"] = {
              stroke: "#dc3545",
              strokeWidth: 1,
            };
          } else if (higherUtilization >= 50) {
            edges_list[i]["style"] = {
              stroke: "#ff8d41",
              strokeWidth: 1,
            };
          } else if (higherUtilization > 0) {
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

        localStorage.setItem("node_dashboard", convertJSONToString(node_list));

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
          if (nodeSelectedG) {
            setEdges(
              frontendEdges.filter(
                (item) =>
                  item.target === nodeSelectedG || item.source === nodeSelectedG
              )
            );
          } else {
            setEdges(frontendEdges);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  };

  const toggleEdgesHandlerAfterRefresh = (
    visible,
    nodes,
    edges,
    isSetEdges = true
  ) => {
    setNodeSelected(null);
    nodeSelectedG = null;
    let hidden = !visible;
    let inners = nodes?.reduce((innerIds, node) => {
      if (node.location === "inner") {
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
      if (nodeSelectedG) {
        setEdges(
          frontendEdges.filter(
            (item) =>
              item.target === nodeSelectedG || item.source === nodeSelectedG
          )
        );
      } else {
        setEdges(updatedEdges);
      }
    }
    return updatedEdges;
  };

  const toggleSecondaryEdgesAfterRefresh = (visible, edges) => {
    setNodeSelected(null);
    nodeSelectedG = null;
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
    if (nodeSelectedG) {
      setEdges(
        frontendEdges.filter(
          (item) =>
            item.target === nodeSelectedG || item.source === nodeSelectedG
        )
      );
    } else {
      setEdges(updatedEdges);
    }
  };

  const toggleEdgesHandler = (hidden) => {
    setNodeSelected(null);
    nodeSelectedG = null;
    setEdgesVisible(!hidden);
    edgesVisibleG = !hidden;
    let inners = nodes?.reduce((innerIds, node) => {
      if (node.location === "inner") {
        innerIds.push(node.id);
        return innerIds;
      }
      return innerIds;
    }, []);

    let updatedEdges = frontendEdges?.map((edge) => {
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
    if (!hidden) {
      setNodeSelected(null);
      nodeSelectedG = null;
    }
    setSecondaryEdgesVisible(!hidden);
    secondaryEdgesVisibleG = !hidden;
    let updatedEdges = frontendEdges?.map((edge) => {
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

  const handleNodeClick = (event, node) => {
    console.log(node);
    console.log(frontendEdges);
    console.log(nodeSelectedG);
    if (nodeSelectedG === node.id) {
      setEdgesVisible(true);
      setSecondaryEdgesVisible(true);
      setNodeSelected(null);
      nodeSelectedG = null;
      setNodeDataSelected(null);
      let updatedEdges = frontendEdges?.map((edge) => {
        return {
          ...edge,
          hidden: false,
        };
      });
      frontendEdges = updatedEdges;
      setEdges(updatedEdges);
    } else {
      setNodeSelected(node.id);
      nodeSelectedG = node.id;
      setNodeDataSelected(node);
      let updatedEdges = frontendEdges?.map((edge) => {
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
      if (nodeSelectedG) {
        setEdges(
          frontendEdges?.filter(
            (item) =>
              item.target === nodeSelectedG || item.source === nodeSelectedG
          )
        );
      } else {
        setEdges(updatedEdges);
      }
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
    let edgesString = localStorage.getItem("edges_list_dashboard");
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

    if (nodeSelectedG) {
      setEdges(
        updatedEdges.filter(
          (item) =>
            item.target === nodeSelectedG || item.source === nodeSelectedG
        )
      );
    } else {
      setEdges(updatedEdges);
    }
  };

  const handleOnEdgeMouseLeave = (event, edge) => {
    let edgesString = localStorage.getItem("edges_list_dashboard");
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

    if (nodeSelectedG) {
      setEdges(
        frontendEdges.filter(
          (item) =>
            item.target === nodeSelectedG || item.source === nodeSelectedG
        )
      );
    } else {
      setEdges(updatedEdges);
    }
  };

  const [hoveredNode, setHoveredNode] = useState(null);
  const handleNodeMouseEnter = (event, node) => {
    setHoveredNode(node);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  return (
    <div
      style={{
        height: "100vh",
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
          closable={false}
        >
          <p>
            Source: {selectedEdgeData?.source} ({selectedEdgeData?.source_ip})
          </p>
          <p>Source Interface: {selectedEdgeData?.interface_a}</p>
          <p>
            Source UPE/Media Device: {selectedEdgeData?.source_upe_media_device}
          </p>

          <p>
            Target: {selectedEdgeData?.target} ({selectedEdgeData?.target_ip})
          </p>
          <p>Target Interface: {selectedEdgeData?.interface_b}</p>
          <p>
            Target UPE/Media Device: {selectedEdgeData?.target_upe_media_device}
          </p>
          <p>Vlan ID: {selectedEdgeData?.vlan_id}</p>
          <p>Download: {selectedEdgeData?.download} mb</p>
          <p>Upload: {selectedEdgeData?.upload} mb</p>
          <p>Link Capacity: {selectedEdgeData?.high_speed} mb</p>
          <p>
            Download Utilization: {selectedEdgeData?.download_utilization} %
          </p>
          <p>Upload Utilization: {selectedEdgeData?.upload_utilization} %</p>
          <p>Errors: {selectedEdgeData?.errors}</p>
          <p>Packet Drops: {selectedEdgeData?.packet_drops}</p>
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
        EDN WAN Topology
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
            zIndex: "888888",
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
            zIndex: "88888",
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

      <div>
        <div
          style={{
            position: "absolute",
            zIndex: "88888",
            marginTop: "160px",
            marginRight: "10px",
            top: "0",
            right: "0",
            color: "grey",
            fontSize: "13px",
            fontWeight: "bolder",
          }}
        >
          Secondary
        </div>
        <Switch
          size="small"
          style={{
            position: "absolute",
            zIndex: "888888",
            marginTop: "180px",
            marginRight: "10px",
            top: "0",
            right: "0",
            width: "40px",
          }}
          checked={secondaryEdgesVisible}
          onChange={(bool) => toggleSecondaryEdges(!bool)}
        />
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
          src={Circle}
          alt="Your Image"
          style={{
            maxHeight: "100%",
            maxWidth: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      {nodes.length !== 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          elements={nodes.concat(edges)}
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
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          nodeTypes={nodeTypes}
        >
          {hoveredNode && (
            <div
              style={{
                position: "absolute",
                top: hoveredNode.position.y - 30, // Adjust as needed
                left: hoveredNode.position.x - 0, // Adjust as needed
                backgroundColor: "white",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "3px",
                fontSize: "10px",
                zIndex: "999999",
              }}
            >
              CPU: {hoveredNode?.cpu_utilization}% &nbsp;&nbsp; MEM:{" "}
              {hoveredNode?.memory_utilization}%
            </div>
          )}
        </ReactFlow>
      )}

      {nodeSelected ? (
        <div
          style={{
            zIndex: "3",
            position: "absolute",
            top: "0",
          }}
        >
          <div
            style={{
              zIndex: "3",
              borderRadius: "3px",
              border: " 1px solid white",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(0px)",
              padding: "10px",
              color: "white",
            }}
          >
            CPU Utilization: {nodeDataSelected?.cpu_utilization}%{" "}
            &nbsp;&nbsp;&nbsp; Memory Utilization:{" "}
            {nodeDataSelected?.memory_utilization}%
          </div>
        </div>
      ) : null}

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
