import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Update() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Daily state
  const [dailyParams, setDailyParams] = useState([]);
  const [dailySelected, setDailySelected] = useState({});
  const [dailyLoading, setDailyLoading] = useState(false);

  // Monthly state
  const [monthlyParams, setMonthlyParams] = useState([]);
  const [monthlySelected, setMonthlySelected] = useState({});
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const today = new Date();
  const allowedDates = [0, 1, 2].map(daysAgo => {
    const d = new Date();
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    axios.get("http://localhost:8080/api/users")
      .then(res => {
        const activeUsers = res.data.filter(user => user.status?.toLowerCase() === "active");
        setUsers(activeUsers);
      })
      .catch(err => console.error("Failed to fetch users:", err));
  }, []);

  useEffect(() => {
    if (!selectedUser || !selectedDate) return;

    // === DAILY LOGIC ===
    setDailyLoading(true);
    axios.get(`http://localhost:8080/api/daily?userId=${selectedUser}&date=${selectedDate}`)
      .then(res => {
        const data = res.data || [];
        if (data.length > 0) {
          const map = {};
          data.forEach(dto => { map[dto.paramId] = dto.metFlag });
          setDailySelected(map);
          setDailyParams(data.map(dto => ({
            paramId: dto.paramId,
            paramName: `Param ${dto.paramId}`
          })));
        } else {
          axios.get(`http://localhost:8080/api/userParameter?userId=${selectedUser}&trackingFrequency=DAILY`)
            .then(res => {
              const defaults = {};
              (res.data || []).forEach(p => { defaults[p.paramId] = false });
              setDailySelected(defaults);
              setDailyParams(res.data || []);
            });
        }
      })
      .finally(() => setDailyLoading(false));

    // === MONTHLY LOGIC ===
    setMonthlyLoading(true);
    axios.get(`http://localhost:8080/api/monthly?userId=${selectedUser}&date=${selectedDate}`)
      .then(res => {
        const data = res.data || [];
        if (data.length > 0) {
          const map = {};
          data.forEach(dto => { map[dto.paramId] = dto.metFlag });
          setMonthlySelected(map);
          setMonthlyParams(data.map(dto => ({
            paramId: dto.paramId,
            paramName: `Param ${dto.paramId}`
          })));
        } else {
          axios.get(`http://localhost:8080/api/userParameter?userId=${selectedUser}&trackingFrequency=MONTHLY`)
            .then(res => {
              const defaults = {};
              (res.data || []).forEach(p => { defaults[p.paramId] = false });
              setMonthlySelected(defaults);
              setMonthlyParams(res.data || []);
            });
        }
      })
      .finally(() => setMonthlyLoading(false));
  }, [selectedUser, selectedDate]);

  const toggleDailyParam = (id) => {
    setDailySelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMonthlyParam = (id) => {
    setMonthlySelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveDaily = async () => {
    const dtoList = dailyParams.map(p => ({
      userId: selectedUser,
      paramId: p.paramId,
      date: selectedDate,
      metFlag: !!dailySelected[p.paramId]
    }));
    try {
      await axios.post("http://localhost:8080/api/daily", dtoList);
      alert("Daily data saved successfully!");
    } catch (err) {
      console.error("Error saving daily data:", err);
      alert("Failed to save daily data.");
    }
  };

  const saveMonthly = async () => {
    const dtoList = monthlyParams.map(p => ({
      userId: selectedUser,
      paramId: p.paramId,
      date: selectedDate,
      metFlag: !!monthlySelected[p.paramId]
    }));
    try {
      await axios.post("http://localhost:8080/api/monthly", dtoList);
      alert("Monthly data saved successfully!");
    } catch (err) {
      console.error("Error saving monthly data:", err);
      alert("Failed to save monthly data.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Parameter Update</h2>

      <div className="mb-4">
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="border p-2 mr-4"
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user.userId} value={user.userId}>{user.name}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border p-2"
          min={allowedDates[2]}
          max={allowedDates[0]}
        />
      </div>

      {/* === DAILY SECTION === */}
      <div className="border p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Daily Update</h3>
        {dailyLoading ? (
          <p>Loading daily data...</p>
        ) : dailyParams.length > 0 ? (
          <>
            {dailyParams.map(p => (
              <label key={p.paramId} className="block">
                <input
                  type="checkbox"
                  checked={!!dailySelected[p.paramId]}
                  onChange={() => toggleDailyParam(p.paramId)}
                  className="mr-2"
                />
                {p.paramName}
              </label>
            ))}
            <button
              onClick={saveDaily}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Daily
            </button>
          </>
        ) : <p>No daily parameters found.</p>}
      </div>

      {/* === MONTHLY SECTION === */}
      <div className="border p-4">
        <h3 className="text-lg font-semibold mb-2">Monthly Update</h3>
        {monthlyLoading ? (
          <p>Loading monthly data...</p>
        ) : monthlyParams.length > 0 ? (
          <>
            {monthlyParams.map(p => (
              <label key={p.paramId} className="block">
                <input
                  type="checkbox"
                  checked={!!monthlySelected[p.paramId]}
                  onChange={() => toggleMonthlyParam(p.paramId)}
                  className="mr-2"
                />
                {p.paramName}
              </label>
            ))}
            <button
              onClick={saveMonthly}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Monthly
            </button>
          </>
        ) : <p>No monthly parameters found.</p>}
      </div>
    </div>
  );
}
