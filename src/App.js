import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/NavBar/navBar.js";
import Dashboard from "./components/Dashboard/Dashboard.js";
import Login from "./components/Login/login.js";
import AddItem from "./components/AddItem/AddItem";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";


const Jewellery = () => <h1>Jewellery</h1>;
const Customers = () => <h1>Customers</h1>;
const Sales = () => <h1>Sales</h1>;
const Purchases = () => <h1>Purchases</h1>;
const Reports = () => <h1>Reports</h1>;
const Settings = () => <h1>Settings</h1>;

const App = () => {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/jewellery"
          element={<Jewellery />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/sales"
          element={<Sales />}
        />

        <Route
          path="/purchases"
          element={<Purchases />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/addJewellery"
          element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          }
        />
        

      </Routes>

    </BrowserRouter>
  );
};

export default App;