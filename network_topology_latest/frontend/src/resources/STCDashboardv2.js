import axios from "../utils/axios";

export let data = {
  utilization_threshold: {
    critical: "90-100",
    critical_color: "#dc3545",
    major: "75-90",
    major_color: "#ff8d41",
    normal: "0-75",
    normal_color: "#038d03",
    zero_color: "#645e5e",
  },
};

// export const getData = async (setData) => {
//   await axios
//     .get("http://127.0.0.1:5001/getResponse", {
//       header: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//     })
//     .then((res) => {
//       setData(res.data);
//       data = res.data;
//     })
//     .catch((err) => {
//       console.log(err);
//       setData(data);
//     });
// };
