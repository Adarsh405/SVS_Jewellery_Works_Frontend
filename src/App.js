import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/NavBar/navBar.js";
import Dashboard from "./components/Dashboard/Dashboard.js";
import Login from "./components/Login/login.js";
import AddItem from "./components/AddItem/AddItem";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import RateUpdate from './components/RateUpdate/rateUpdate'
import Payment from "./components/Payment/Payment";
import Sales from "./components/Sales/sales.js"
import Inventory from "./components/Inventory/Inventory"
import GoldPriceSection from './components/GoldPriceSection/GoldPriceSection'
import OldSilverPriceSection from './components/OldSilverPriceSection/OldSilverPriceSection'
import Orders from './components/Orders/Orders';

const App = () => {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

       

        {/* Admin Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected Add Jewellery */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Inventory"
          element={
              <Inventory />
          }
        />
        <Route path="/orders" element={<Orders />} />
        <Route
            path="/goldPriceSection"
            element={<GoldPriceSection />}
        />

        <Route
            path="/oldSilverPriceSection"
            element={<OldSilverPriceSection />}
        />
        <Route
          path="/addJewellery"
          element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Rates"
          element={
            <ProtectedRoute>
              <RateUpdate />
            </ProtectedRoute>
          }
        />
        <Route path="/payment" element={<Payment />} />
      </Routes>

    </BrowserRouter>
  );
};

export default App;