import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function UserParameters() {
  const [users, setUsers] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedParams, setSelectedParams] = useState([]);
  const [userParams, setUserParams] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users", err));

    axios.get(`${API_BASE_URL}/api/parameters`)
      .then((res) => setParameters(res.data))
      .catch((err) => console.error("Failed to fetch parameters", err));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`${API_BASE_URL}/api/userParameter/${selectedUser}`)
        .then((res) => {
          const paramList = res.data.parameterDTOList || [];
          setUserParams(paramList);
          setSelectedParams(paramList.map(p => p.paramId)); // ✅ auto-check
        })
        .catch((err) => console.error("Failed to fetch user parameters", err));
    } else {
      // Clear states if no user is selected
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
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Assign Parameters to User</h2>

      <select
        value={selectedUser || ""}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="border p-1 mb-2"
      >
        <option value="" disabled>Select User</option>
        {users.map(user => (
          <option key={user.userId} value={user.userId}>{user.name}</option>
        ))}
      </select>

      <div className="space-y-1 mb-2">
        {parameters.map(param => (
          <label key={param.paramId} className="block">
            <input
              type="checkbox"
              checked={selectedParams.includes(param.paramId)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedParams(prev => [...prev, param.paramId]);
                } else {
                  setSelectedParams(prev => prev.filter(id => id !== param.paramId));
                }
              }}
            /> {param.paramName}
          </label>
        ))}
      </div>

      {selectedUser && (
        <button
          onClick={handleAssign}
          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Assign Selected
        </button>
      )}

      {userParams.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-4">Assigned Parameters:</h3>
          <ul className="list-disc pl-5">
            {userParams.map(param => (
              <li key={param.paramId}>
                {param.paramName} ({param.trackingFrequency})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
