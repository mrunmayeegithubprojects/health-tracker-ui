import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  Link,
} from "react-router-dom";
import Users from "./components/Users";
import Parameters from "./components/Parameters";
import UserParameters from "./components/UserParameters";
import Update from "./components/Update";
import Rewards from "./components/Rewards";
import LandingPage from "./components/LandingPage";

export default function App() {
  return (
    <Router>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          <Link to="/" style={{ textDecoration: "none", color: "#3949ab" }}>
            Rewards Tracker
          </Link>
        </h1>

        <nav className="navbar" style={{ marginBottom: "16px" }}>
          <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>Users</NavLink>
          <NavLink to="/parameters" className={({ isActive }) => (isActive ? "active" : "")}>Growth Parameters</NavLink>
          <NavLink to="/user-parameters" className={({ isActive }) => (isActive ? "active" : "")}>Assign Parameters</NavLink>
          <NavLink to="/update" className={({ isActive }) => (isActive ? "active" : "")}>Update</NavLink>
          <NavLink to="/rewards" className={({ isActive }) => (isActive ? "active" : "")}>Rewards</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="/parameters" element={<Parameters />} />
          <Route path="/user-parameters" element={<UserParameters />} />
          <Route path="/update" element={<Update />} />
          <Route path="/rewards" element={<Rewards />} />
        </Routes>
      </div>
    </Router>
  );
}
