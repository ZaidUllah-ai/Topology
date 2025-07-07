// import React, { useContext } from "react";
// import { Context } from "../context";

// const MergedUtilizationCard = ({ cpuMemoryData = {}, interfaceData = [] }) => {
//     const { constants } = useContext(Context);
//     const { topCpu = [], topMemory = [] } = cpuMemoryData;

//     return (
//         <div
//             style={{
//                 zIndex: 3,
//                 width: "auto",
//                 maxWidth: "100%",
//                 position: "absolute",
//                 bottom: 0,
//                 right: 0,
//                 padding: "0.4%",
//             }}
//         >
//             <div
//                 style={{
//                     borderRadius: "6px",
//                     border: "1px solid white",
//                     background: "rgba(0, 0, 0, 0.6)",
//                     backdropFilter: "blur(2px)",
//                     padding: "10px 15px",
//                     display: "flex",
//                     gap: "30px",
//                     color: "white",
//                     fontSize: "12px",
//                 }}
//             >
//                 {/* CPU Column */}
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                     <div
//                         style={{
//                             fontWeight: "bold",
//                             fontSize: "12px",
//                             textAlign: "center",
//                             marginBottom: "6px",
//                         }}
//                     >
//                         Top 5 CPU Utilization
//                     </div>
//                     {topCpu.map((item, index) => (
//                         <div
//                             key={index}
//                             style={{ marginBottom: "8px", whiteSpace: "nowrap" }}
//                         >
//                             {index + 1}. {item.device} ↔ {item.cpu_utilization}%
//                         </div>
//                     ))}
//                 </div>

//                 {/* Memory Column */}
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                     <div
//                         style={{
//                             fontWeight: "bold",
//                             fontSize: "12px",
//                             textAlign: "center",
//                             marginBottom: "6px",
//                         }}
//                     >
//                         Top 5 Memory Utilization
//                     </div>
//                     {topMemory.map((item, index) => (
//                         <div
//                             key={index}
//                             style={{ marginBottom: "8px", whiteSpace: "nowrap" }}
//                         >
//                             {index + 1}. {item.device} ↔ {item.memory_utilization}%
//                         </div>
//                     ))}
//                 </div>

//                 {/* Interface Utilization Column */}
//                 <div style={{ flex: 1.8, minWidth: 0 }}>
//                     <div
//                         style={{
//                             fontWeight: "bold",
//                             fontSize: "12px",
//                             textAlign: "center",
//                             marginBottom: "6px",
//                         }}
//                     >
//                         Top 5 Interface Utilizations
//                     </div>

//                     {interfaceData.map((item, index) => {
//                         const maxPercentage = Math.max(
//                             parseFloat(item.download_percentage || 0),
//                             parseFloat(item.upload_percentage || 0)
//                         );

//                         let color = constants.utilization_threshold.zero_color;
//                         if (maxPercentage >= 90)
//                             color = constants.utilization_threshold.critical_color;
//                         else if (maxPercentage >= 75)
//                             color = constants.utilization_threshold.major_color;
//                         else if (maxPercentage > 0)
//                             color = constants.utilization_threshold.normal_color;

//                         return (
//                             <div
//                                 key={index}
//                                 style={{
//                                     marginBottom: "10px",
//                                     display: "flex",
//                                     flexDirection: "column",
//                                     fontSize: "11px",
//                                 }}
//                             >
//                                 {/* Device row with Download */}
//                                 <div style={{ display: "flex", justifyContent: "space-between" }}>
//                                     <span style={{ fontWeight: 500 }}>
//                                         {index + 1}. {item.routerA} ↔ {item.routerB}
//                                     </span>
//                                     <span style={{}}>
//                                         U: {item.upload_percentage}%
//                                     </span>
//                                 </div>

//                                 {/* Interface row with Upload */}
//                                 <div
//                                     style={{
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         opacity: 0.8,
//                                     }}
//                                 >
//                                     <span>{item.routerAInterface} ↔ {item.routerBInterface}</span>
//                                     <span style={{}}>
//                                         D: {item.download_percentage}%
//                                     </span>
//                                 </div>
//                             </div>
//                         );

//                     })}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MergedUtilizationCard;



import React, { useContext } from "react";
import { Context } from "../context";

const MergedUtilizationCard = ({ cpuMemoryData = {}, interfaceData = [] }) => {
    const { constants } = useContext(Context);
    const { topCpu = [], topMemory = [] } = cpuMemoryData;

    return (
        <div
            style={{
                zIndex: 3,
                width: "auto",
                maxWidth: "100%",
                position: "absolute",
                bottom: 0,
                right: 0,
                padding: "0.4%",
            }}
        >
            <div
                style={{
                    borderRadius: "6px",
                    border: "1px solid white",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(2px)",
                    padding: "10px 15px",
                    display: "flex",
                    gap: "15px",
                    color: "white",
                    fontSize: "12px",
                }}
            >
                {/* CPU Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            textAlign: "center",
                            marginBottom: "10px"
                        }}
                    >
                        Top 5 CPU Utilization
                    </div>
                    {topCpu.map((item, index) => (
                        <div
                            key={index}
                            style={{ marginBottom: "10px", whiteSpace: "nowrap" }}
                        >
                            {index + 1}. {item.device} ↔ {item.cpu_utilization}%
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: "3px",
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                    }}
                />

                {/* Memory Column */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            textAlign: "center",
                            marginBottom: "10px",
                        }}
                    >
                        Top 5 Memory Utilization
                    </div>
                    {topMemory.map((item, index) => (
                        <div
                            key={index}
                            style={{ marginBottom: "10px", whiteSpace: "nowrap" }}
                        >
                            {index + 1}. {item.device} ↔ {item.memory_utilization}%
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: "3px",
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                        marginLeft: "8px"
                    }}
                />

                {/* Interface Utilization Column */}
                <div style={{ flex: 1.8, minWidth: 0 }}>
                    <div
                        style={{
                            fontWeight: "bold",
                            fontSize: "12px",
                            textAlign: "center",
                            marginBottom: "6px",
                        }}
                    >
                        Top 5 Interface Utilizations
                    </div>

                    {interfaceData.map((item, index) => {
                        const maxPercentage = Math.max(
                            parseFloat(item.download_percentage || 0),
                            parseFloat(item.upload_percentage || 0)
                        );

                        let color = constants.utilization_threshold.zero_color;
                        if (maxPercentage >= 90)
                            color = constants.utilization_threshold.critical_color;
                        else if (maxPercentage >= 75)
                            color = constants.utilization_threshold.major_color;
                        else if (maxPercentage > 0)
                            color = constants.utilization_threshold.normal_color;

                        return (
                            <div
                                key={index}
                                style={{
                                    marginBottom: "6px",
                                    display: "flex",
                                    flexDirection: "column",
                                    fontSize: "11px",
                                }}
                            >
                                {/* Device ↔ Device + Upload */}
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>
                                        {index + 1}. {item.routerA} ↔ {item.routerB}
                                    </span>
                                    <span>
                                        U: {item.upload_percentage}%
                                    </span>
                                </div>

                                {/* Interface ↔ Interface + Download */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        // opacity: 0.8,
                                    }}
                                >
                                    <span style={{opacity: "0.8"}}>{item.routerAInterface} ↔ {item.routerBInterface}</span>
                                    <span>
                                        D: {item.download_percentage}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MergedUtilizationCard;
