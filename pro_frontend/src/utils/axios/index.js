import axios from "axios";

// export const baseUrl = "http://localhost:5001"; //! local
export const baseUrl = "https://10.73.211.165:8443/edn-topology"; //! production
export const baseUrlCentral =
  "https://10.73.211.165:8443/flagship-topology-central"; //! production
export const baseUrlEastern =
  "https://10.73.211.165:8443/flagship-topology-eastern"; //! production
export const baseUrlWestern =
  "https://10.73.211.165:8443/flagship-topology-western"; //! production

const instance = axios.create();
instance.interceptors.request.use((config) => {
  // if (token) {
  //   config.headers["X-Auth-Key"] = token;
  //   config.headers["X-Content-Type-Options"] = "nosniff";
  // }
  return config;
});

export default instance;



// import axios from "axios";

// // export const baseUrl = "http://localhost:5001"; //! local
// export const baseUrl = "http://127.0.0.1:5000"; //! production
// export const baseUrlCentral =
//   "http://127.0.0.1:5000/flagship-topology-central"; //! production
// export const baseUrlEastern =
//   "http://127.0.0.1:5000/flagship-topology-eastern"; //! production
// export const baseUrlWestern =
//   "http://127.0.0.1:5000/flagship-topology-western"; //! production

// const instance = axios.create();
// instance.interceptors.request.use((config) => {
//   // if (token) {
//   //   config.headers["X-Auth-Key"] = token;
//   //   config.headers["X-Content-Type-Options"] = "nosniff";
//   // }
//   return config;
// });

// export default instance;
