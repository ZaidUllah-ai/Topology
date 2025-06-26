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
