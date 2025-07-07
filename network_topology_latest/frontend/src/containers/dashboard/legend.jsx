import React, { useState, useEffect, useContext } from "react";
import { Col, Row } from "antd";
import styled from "styled-components";
import { Context } from "../../context";

const Legend = (props) => {
  const { constants } = useContext(Context);

  return (
    <div
      style={{
        zIndex: "3",
        width: "15%",
        padding: "0.7%",
        float: "right",
        position: "absolute",
        bottom: "0",
        left: "0",
        // clear: "left",
      }}
    >
      <div
        style={{
          zIndex: "100",
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          border: " 1px solid white",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(0px)",
          padding: "4%",
          // boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
        }}
      >
        <Row style={{ height: "100%" }}>
          <Col
            span={8}
            style={{ borderRight: "0px dashed white", height: "12%" }}
          >
            <div
              style={{
                color: "white",
                fontSize: "13px",
                textAlign: "center",
                // paddingTop: "2%",
                paddingBottom: "5px",
              }}
            >
              Colors
            </div>
          </Col>
          <Col
            span={16}
            style={{
              borderBottom: "0px dashed white",
              borderLeft: "1px dashed white",
              height: "12%",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "13px",
                textAlign: "center",
                backgroundbackground: "rgba(0, 0, 0, 0.60)",
                // paddingTop: "2%",
                paddingBottom: "5px",
              }}
            >
              Link Utilization %
            </div>
          </Col>
          <Col
            span={8}
            style={{
              borderTop: "1px dashed white",
              height: "88%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <StyledHex
                  color={constants.utilization_threshold.critical_color}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <StyledHex
                  color={constants.utilization_threshold.major_color}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <StyledHex
                  color={constants.utilization_threshold.normal_color}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <StyledHex color={constants.utilization_threshold.zero_color} />
              </div>
            </div>
          </Col>
          <Col
            span={16}
            style={{
              borderLeft: "1px dashed white",
              borderTop: "1px dashed white",
              height: "88%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "8px",
                paddingBottom: "3px",
              }}
            >
              <div
                style={{
                  color: "white",
                }}
              >
                80 - 100
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "8px",
                paddingBottom: "3px",
              }}
            >
              <div
                style={{
                  color: "white",
                }}
              >
                50 - 80
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "8px",
                paddingBottom: "3px",
              }}
            >
              <div
                style={{
                  color: "white",
                }}
              >
                0 - 50
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "5px",
                paddingBottom: "10px",
              }}
            >
              <div
                style={{
                  color: "white",
                }}
              >
                0
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Legend;

const StyledHex = styled.span`
  & {
    margin-top: 17px;
    width: 21px;
    height: 9px;
    background-color: ${(props) => (props.color ? props.color : "red")};
    border-color: ${(props) => (props.color ? props.color : "red")};
    position: relative;
    display: inline-block;
  }

  &:before {
    content: " ";
    width: 0;
    height: 0;
    top: -7px;
    border-bottom: 7px solid;
    border-color: inherit;
    border-left: 11px solid transparent;
    border-right: 11px solid transparent;
    position: absolute;
  }

  &:after {
    content: "";
    width: 0;
    position: absolute;
    bottom: -7px;
    border-top: 7px solid;
    border-color: inherit;
    border-left: 11px solid transparent;
    border-right: 11px solid transparent;
  }
`;
