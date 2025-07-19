import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import "./UserParameters.css";

export default function UserParameters() {
  const [users, setUsers] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedParams, setSelectedParams] = useState([]);
  const [userParams, setUserParams] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/users`)
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to fetch users", err));

    axios.get(`${API_BASE_URL}/api/parameters`)
      .then(res => setParameters(res.data))
      .catch(err => console.error("Failed to fetch parameters", err));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`${API_BASE_URL}/api/userParameter/${selectedUser}`)
        .then(res => {
          const paramList = res.data.parameterDTOList || [];
          setUserParams(paramList);
          setSelectedParams(paramList.map(p => p.paramId));
        })
        .catch(err => console.error("Failed to fetch user parameters", err));
    } else {
      setUserParams([]);
      setSelectedParams([]);
    }
  }, [selectedUser]);

  const handleAssign = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/userParameter`, {
        userId: selectedUser,
        parameterIds: selectedParams
      });
      const res = await axios.get(`${API_BASE_URL}/api/userParameter/${selectedUser}`);
      setUserParams(res.data.parameterDTOList || []);
      alert("Parameters assigned successfully!");
    } catch (err) {
      console.error("Error assigning parameters", err);
      alert("Failed to assign parameters.");
    }
  };

  return (
    <div className="user-param-wrapper">
      <h2 className="heading">Assign Parameters</h2>

      {/* User Dropdown */}
      <label className="label">Select a User:</label>
      <select
        value={selectedUser || ""}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="input-select"
      >
        <option value="" disabled>Select User</option>
        {users.map(user => (
          <option key={user.userId} value={user.userId}>{user.name}</option>
        ))}
      </select>

      {/* Split view */}
      {selectedUser && (
        <div className="split-view">
          {/* Left: Available */}
          <div className="left-panel">
            <h3 className="sub-heading">Available Parameters</h3>
            <div className="checkbox-group">
              {parameters.map(param => (
                <label key={param.paramId} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedParams.includes(param.paramId)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selectedParams, param.paramId]
                        : selectedParams.filter(id => id !== param.paramId);
                      setSelectedParams(updated);
                    }}
                  />
                  {param.paramName}
                </label>
              ))}
            </div>
            <button onClick={handleAssign} className="assign-button">
              Save Assignment
            </button>
          </div>

          {/* Right: Assigned */}
          <div className="right-panel">
            <h3 className="sub-heading">Assigned Parameters</h3>
            <ul className="param-list">
              {userParams.map(param => (
                <li key={param.paramId}>
                  {param.paramName} ({param.trackingFrequency})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
