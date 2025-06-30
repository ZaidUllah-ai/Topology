import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./containers/dashboard";
import CentralFlagship from "./containers/centralFlagship";
import EasternFlagship from "./containers/easternFlagship";
import WesternFlagship from "./containers/westernFlagship";
import Context from "./context";

const App = () => {
  return (
    <Context>
      <Router>
        <title></title>
        <Routes>
          {/* <Route path="/" element={<Dashboard />} />
          <Route path="/central" element={<CentralFlagship />} />
          <Route path="/eastern" element={<EasternFlagship />} />
          <Route path="/western" element={<WesternFlagship />} /> */}
          <Route path="/edn-topology-dashboard" element={<Dashboard />} />
          <Route
            path="/edn-topology-dashboard/central"
            element={<CentralFlagship />}
          />
          <Route
            path="/edn-topology-dashboard/eastern"
            element={<EasternFlagship />}
          />
          <Route
            path="/edn-topology-dashboard/western"
            element={<WesternFlagship />}
          />
        </Routes>
      </Router>
    </Context>
  );
};

export default App;
