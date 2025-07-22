import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function Update() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [dailyParams, setDailyParams] = useState([]);
  const [dailySelected, setDailySelected] = useState({});
  const [dailyLoading, setDailyLoading] = useState(false);

  const [monthlyParams, setMonthlyParams] = useState([]);
  const [monthlySelected, setMonthlySelected] = useState({});
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/users`)
      .then(res => {
        const activeUsers = res.data.filter(user => user.status?.toLowerCase() === "active");
        setUsers(activeUsers);
      })
      .catch(err => console.error("Failed to fetch users:", err));
  }, []);

  useEffect(() => {
    if (!selectedUser || !selectedDate) return;

    setDailyLoading(true);
    axios.get(`${API_BASE_URL}/api/daily?userId=${selectedUser}&date=${selectedDate}`)
      .then(res => {
        const data = res.data || [];
        if (data.length > 0) {
          const map = {};
          data.forEach(dto => { map[dto.paramId] = dto.metFlag });
          setDailySelected(map);
          axios.get(`${API_BASE_URL}/api/userParameter?userId=${selectedUser}&trackingFrequency=DAILY`)
            .then(paramRes => {
              const paramMap = {};
              (paramRes.data || []).forEach(p => {
                paramMap[p.paramId] = p.paramName;
              });

              setDailyParams(data.map(dto => ({
                paramId: dto.paramId,
                paramName: paramMap[dto.paramId] || `Param ${dto.paramId}`
              })));
            });

        } else {
          axios.get(`${API_BASE_URL}/api/userParameter?userId=${selectedUser}&trackingFrequency=DAILY`)
            .then(res => {
              const defaults = {};
              (res.data || []).forEach(p => { defaults[p.paramId] = false });
              setDailySelected(defaults);
              setDailyParams(res.data || []);
            });
        }
      })
      .finally(() => setDailyLoading(false));

    setMonthlyLoading(true);
    axios.get(`${API_BASE_URL}/api/monthly?userId=${selectedUser}&date=${selectedDate}`)
      .then(res => {
        const data = res.data || [];
        if (data.length > 0) {
          const map = {};
          data.forEach(dto => { map[dto.paramId] = dto.metFlag });
          setMonthlySelected(map);
          axios.get(`${API_BASE_URL}/api/userParameter?userId=${selectedUser}&trackingFrequency=MONTHLY`)
            .then(paramRes => {
              const paramMap = {};
              (paramRes.data || []).forEach(p => {
                paramMap[p.paramId] = p.paramName;
              });

              setMonthlyParams(data.map(dto => ({
                paramId: dto.paramId,
                paramName: paramMap[dto.paramId] || `Param ${dto.paramId}`
              })));
            });

        } else {
          axios.get(`${API_BASE_URL}/api/userParameter?userId=${selectedUser}&trackingFrequency=MONTHLY`)
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
      await axios.post(`${API_BASE_URL}/api/daily`, dtoList);
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
      await axios.post(`${API_BASE_URL}/api/monthly`, dtoList);
      alert("Monthly data saved successfully!");
    } catch (err) {
      console.error("Error saving monthly data:", err);
      alert("Failed to save monthly data.");
    }
  };

  const lavender = "#7b6cd9";

  const styles = {
    container: { padding: "24px" },
    title: {
      fontSize: "34px",
      fontWeight: "700",
      marginBottom: "24px",
      color: lavender
    },
    input: {
      fontSize: "18px",
      padding: "8px 12px",
      marginRight: "16px",
      border: "1px solid #ccc",
      borderRadius: "6px"
    },
    inputRow: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "32px"
    },
    splitWrap: {
      display: "flex",
      flexWrap: "wrap",
      gap: "24px",
      alignItems: "flex-start"
    },
    section: {
      flex: "1 1 460px",
      border: "1px solid #ccc",
      borderRadius: "12px",
      padding: "24px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      maxHeight: "600px",
      overflow: "auto"
    },
    heading: {
      fontSize: "28px",
      fontWeight: "600",
      marginBottom: "16px",
      color: lavender
    },
    label: {
      fontSize: "18px",
      color: "#333",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center"
    },
    checkbox: {
      marginRight: "10px"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "12px"
    },
    button: {
      marginTop: "20px",
      padding: "10px 20px",
      fontSize: "18px",
      backgroundColor: lavender,
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Parameter Update</h2>

      <div style={styles.inputRow}>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={styles.input}
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
          style={styles.input}
        />
      </div>

      <div style={styles.splitWrap}>
        {/* DAILY SECTION */}
        <div style={styles.section}>
          <h3 style={styles.heading}>Daily Update</h3>
          {dailyLoading ? (
            <p style={{ color: "#666" }}>Loading daily data...</p>
          ) : dailyParams.length > 0 ? (
            <>
              <div style={styles.grid}>
                {dailyParams.map(p => (
                  <label key={p.paramId} style={styles.label}>
                    <input
                      type="checkbox"
                      checked={!!dailySelected[p.paramId]}
                      onChange={() => toggleDailyParam(p.paramId)}
                      style={styles.checkbox}
                    />
                    {p.paramName}
                  </label>
                ))}
              </div>
              <button onClick={saveDaily} style={styles.button}>
                Save Daily
              </button>
            </>
          ) : <p style={{ color: "#777" }}>No daily parameters found.</p>}
        </div>

        {/* MONTHLY SECTION */}
        <div style={styles.section}>
          <h3 style={styles.heading}>Monthly Update</h3>
          {monthlyLoading ? (
            <p style={{ color: "#666" }}>Loading monthly data...</p>
          ) : monthlyParams.length > 0 ? (
            <>
              <div style={styles.grid}>
                {monthlyParams.map(p => (
                  <label key={p.paramId} style={styles.label}>
                    <input
                      type="checkbox"
                      checked={!!monthlySelected[p.paramId]}
                      onChange={() => toggleMonthlyParam(p.paramId)}
                      style={styles.checkbox}
                    />
                    {p.paramName}
                  </label>
                ))}
              </div>
              <button onClick={saveMonthly} style={styles.button}>
                Save Monthly
              </button>
            </>
          ) : <p style={{ color: "#777" }}>No monthly parameters found.</p>}
        </div>
      </div>
    </div>
  );
}
