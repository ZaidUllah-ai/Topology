// import React, { useContext } from "react";
// import { Context } from "../../context";

// const TopUtilizationCard = ({ data }) => {
//   const { constants } = useContext(Context);

//   return (
//     <div
//       style={{
//         zIndex: "3",
//         width: "30%",
//         padding: "0.7%",
//         float: "right",
//         position: "absolute",
//         bottom: "0",
//         right: "0",
//         clear: "right",
//       }}
//     >
//       <div
//         style={{
//           zIndex: "3",
//           borderRadius: "8px",
//           border: " 1px solid white",
//           background: "rgba(0, 0, 0, 0.5)",
//           backdropFilter: "blur(0px)",
//           padding: "4%",
//         }}
//       >
//         <div
//           style={{
//             color: "white",
//             fontSize: "13px",
//             textAlign: "center",
//             paddingBottom: "5px",
//           }}
//         >
//           Top 5 Interface Utilizations
//         </div>
//         {data.map((element, index) => {
//           let color = constants.utilization_threshold.critical_color;
//           if (element?.percentage > 75 && element?.percentage < 90) {
//             color = constants.utilization_threshold.major_color;
//           } else if (element?.percentage > 0 && element?.percentage < 75) {
//             color = constants.utilization_threshold.normal_color;
//           } else {
//             color = constants.utilization_threshold.zero_color;
//           }
//           return (
//             <div
//               key={index}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 color: "white",
//                 padding: "5px",
//                 fontSize: "10px",
//                 fontWeight: "500",
//                 // color,
//                 // wordWrap: "normal",
//               }}
//             >
//               <div>
//                 {index + 1}. {element?.routerA}
//                 {"<-->"}
//                 {element?.routerB}
//                 <br />
//                 {element?.routerAInterface}
//                 {"<-->"}
//                 {element?.routerBInterface}
//               </div>
//               {/* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
//               <div>
//                 D-{element?.download_percentage}% - U-
//                 {element?.upload_percentage}%
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default TopUtilizationCard;


// New Card for Top CPU & Memory Utilization
import React, { useContext } from "react";
import { Context } from "../../context";

const TopUtilizationCard = ({ data }) => {
  const { constants } = useContext(Context);

  return (
    <div
      style={{
        zIndex: "3",
        width: "30%",
        padding: "0.4%",
        position: "absolute",
        bottom: "0",
        right: "0",
      }}
    >
      <div
        style={{
          borderRadius: "6px",
          border: "1px solid white",
          background: "rgba(0, 0, 0, 0.60)",
          backdropFilter: "blur(2px)",
          padding: "8px 10px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "14px",
            textAlign: "center",
            paddingBottom: "4px",
            fontWeight: "bold",
            marginBottom: "4px"
          }}
        >
          Top 5 Interface Utilizations
        </div>
        {data.map((element, index) => {
          const maxPercentage = Math.max(
            parseFloat(element?.download_percentage || 0),
            parseFloat(element?.upload_percentage || 0)
          );
          
          let color = constants.utilization_threshold.zero_color;
          if (maxPercentage >= 90) {
            color = constants.utilization_threshold.critical_color;
          } else if (maxPercentage >= 75) {
            color = constants.utilization_threshold.major_color;
          } else if (maxPercentage > 0) {
            color = constants.utilization_threshold.normal_color;
          }

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-start",
                color: "white",
                padding: "2px 0",
                fontSize: "12px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, lineHeight: "1.2" }}>
                  {index + 1}. {element?.routerA} ↔ {element?.routerB}
                </div>
                <div style={{ 
                  fontSize: "11px",
                  opacity: 0.80,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "1.2"
                }}>
                  {element?.routerAInterface} ↔ {element?.routerBInterface}
                </div>
              </div>
              
              <div style={{ 
                color: "white",
                minWidth: "80px",
                textAlign: "right",
                paddingLeft: "2px",
                lineHeight: "1.2",
                fontSize: "10px",
              }}>
                <div>Download: {element?.download_percentage}%</div>
                <div>Upload: {element?.upload_percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopUtilizationCard;