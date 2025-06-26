import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
} from "recharts";

// import SimpleAreaChart from '../../components/SimpleAreaChart';



import React, { useEffect, useState, useCallback, useContext } from "react";
import axios, { baseUrl } from "../../utils/axios/index";
import Logo from "./logo";
import Router from "../../resources/images/router.png";
import ReactFlow, { addEdge } from "reactflow";
import "reactflow/dist/style.css";
import Circle from "../../resources/images/Circle.svg";
import TopUtilizationCard from "./topUtilizationCard";
import Legend from "./legend";
import { Switch, Modal, Button } from "antd";
import { Context } from "../../context";

const DEFAULT_WINDOW_WIDTH = 2100;
const DEFAULT_WINDOW_HEIGHT = 1180;
let toggleNodes = false;
let edgesVisibleG = true;
let secondaryEdgesVisibleG = true;

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
    localStorage.removeItem("edges_list");
    axios
      .get(`${baseUrl}/topInterfaceUtilization`)
      .then((response) => {
        setTopUtils(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios
      .get(`${baseUrl}/get-router`)
      .then((response) => {
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
                  src={Router}
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
        console.error("Error fetching data: ", error);
      });
  }, []);

  const handleApis = () => {
    setVisible(false);
    axios
      .get(`${baseUrl}/topInterfaceUtilization`)
      .then((response) => {
        setTopUtils(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios
      .get(`${baseUrl}/get-router`)
      .then((response) => {
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
                  src={Router}
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

  const trendData = (selectedEdgeData?.upload_utilization_trend || []).map((item, index) => ({
    time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    upload: item.value,
    download: selectedEdgeData?.download_utilization_trend?.[index]?.value || 0,
  }));

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {visible ? (
        <Modal
          title={
            <div style={{ textAlign: 'center', width: '100%' }}>
              <p><strong>Edge Details</strong> </p>
            </div>
          }
          visible={visible}
          onOk={handleOk}
          onCancel={null}
          closable={false}
          width={1000}
          // height={300}
          footer={[
            <Button key="ok" type="primary" onClick={handleOk}>
              OK
            </Button>,
          ]}
          style={{
            top: 40,
            transform: 'translate(-50%, 0)',
            left: '40%',
            position: 'Fixed',	
          }}
        >
          <p><strong>Source:</strong> {selectedEdgeData?.source} ({selectedEdgeData?.source_ip})</p>
          <p><strong>Source Interface:</strong> {selectedEdgeData?.interface_a}</p>
          <p><strong>Source UPE/Media Device:</strong> {selectedEdgeData?.upe_device_a || 'NA'}</p>

          <p><strong>Target:</strong> {selectedEdgeData?.target} ({selectedEdgeData?.target_ip})</p>
          <p><strong>Target Interface:</strong> {selectedEdgeData?.interface_b}</p>
          <p><strong>Target UPE/Media Device:</strong> {selectedEdgeData?.upe_device_b || 'NA'}</p>

          <p><strong>Vlan ID:</strong> {selectedEdgeData?.vlan_id || 'NA'}</p>

          <p><strong>Download:</strong> {selectedEdgeData?.download} mb</p>
          <p><strong>Upload:</strong> {selectedEdgeData?.upload} mb</p>
          <p><strong>Link Capacity:</strong> {selectedEdgeData?.high_speed} mb</p>

          <p><strong>Download Utilization:</strong> {selectedEdgeData?.download_utilization} %</p>
          <p><strong>Upload Utilization:</strong> {selectedEdgeData?.upload_utilization} %</p>

          <p><strong>Errors:</strong> in-{selectedEdgeData?.input_errors || 0}, out-{selectedEdgeData?.output_errors || 0}</p>
          <p><strong>Packet Drops:</strong> in-{selectedEdgeData?.input_drops || 0}, out-{selectedEdgeData?.output_drops || 0}</p>

          {/* Download Trend */}
          {/* <div>
            <strong>Download Utilization Trend:</strong>
            <ul style={{ maxHeight: '200px', overflowY: 'auto', paddingLeft: '20px' }}>
              {(selectedEdgeData?.download_utilization_trend || []).map((item, index) => (
                <li key={index}>{item.time} - {item.value.toFixed(2)}%</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Upload Utilization Trend:</strong>
            <ul style={{ maxHeight: '200px', overflowY: 'auto', paddingLeft: '20px' }}>
              {(selectedEdgeData?.upload_utilization_trend || []).map((item, index) => (
                <li key={index}>{item.time} - {item.value.toFixed(2)}%</li>
              ))}
            </ul>
          </div> */}

          <h3 style={{ marginTop: 5, textAlign: "center" }}>Utilization Trend</h3>
          <ResponsiveContainer width="90%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f9b115" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f9b115" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <RechartsLegend />
              <Area type="monotone" dataKey="upload" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUpload)" name="Upload Utilization" />
              <Area type="monotone" dataKey="download" stroke="#f9b115" fillOpacity={1} fill="url(#colorDownload)" name="Download Utilization" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Simple Chart */}
          <h3 style={{ marginTop: 5, textAlign: "center" }}>Utilization Trend</h3>
          <SimpleAreaChart data={trendData} width={900} height={250} />

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

      <div>
        <div
          style={{
            position: "absolute",
            zIndex: "99999",
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
            zIndex: "99999",
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
          onPaneScroll={(e) => { }}
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
