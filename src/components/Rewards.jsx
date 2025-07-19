import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function Rewards() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [rewardMessage, setRewardMessage] = useState("");
  const [rewardConsumed, setRewardConsumed] = useState("");
  const [calcMessage, setCalcMessage] = useState("");

  useEffect(() => {
    const now = new Date();
    const cutoffDay = 4;
    const includePrevMonth = now.getDate() >= cutoffDay;

    const months = [];
    const startOffset = includePrevMonth ? 1 : 2;

    for (let i = startOffset; i < startOffset + 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      months.push(`${mm}-${yyyy}`);
    }

    setAvailableMonths(months);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/users`)
      .then(res => {
        const activeUsers = res.data.filter(user => user.status?.toLowerCase() === "active");
        setUsers(activeUsers);
      })
      .catch(err => console.error("Failed to fetch users", err));
  }, []);

  useEffect(() => {
    if (!selectedUser || !selectedMonth) return;

    setRewardMessage("Fetching reward...");

    axios.get(`${API_BASE_URL}/api/rewards`, {
      params: {
        userId: selectedUser,
        monYear: selectedMonth
      }
    })
      .then(res => {
        const val = res.data;
        if (!val && val !== 0) {
          axios.post(`${API_BASE_URL}/api/rewards`, {
            userId: selectedUser,
            key: selectedMonth
          })
            .then(() =>
              axios.get(`${API_BASE_URL}/api/rewards`, {
                params: {
                  userId: selectedUser,
                  monYear: selectedMonth
                }
              })
            )
            .then(res2 => {
              setRewardMessage(`Your ${selectedMonth} reward value is : ${res2.data}`);
            })
            .catch(err2 => {
              console.error("Error during post + refetch", err2);
              setRewardMessage("Failed to create and fetch reward.");
            });
        } else {
          setRewardMessage(`Your ${selectedMonth} reward value is : ${val}`);
        }
      })
      .catch(err => {
        console.error("Error in reward GET", err);
        setRewardMessage("Error while fetching reward.");
      });
  }, [selectedUser, selectedMonth]);

  const handleRewardConsumedSave = () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const key = `RewardConsumed_${mm}-${yyyy}`;

    if (!rewardConsumed || isNaN(rewardConsumed)) {
      alert("Enter a valid reward point (number).");
      return;
    }

    axios.post(`${API_BASE_URL}/api/rewards`, {
      userId: selectedUser,
      key,
      rewardAdjustment: parseFloat(rewardConsumed)
    })
      .then(() => {
        alert("Reward consumption saved!");
        setRewardConsumed("");
      })
      .catch(err => {
        console.error("Save reward consumption failed", err);
        alert("Failed to save reward consumption.");
      });
  };

  const handleCalculateNow = () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }

    axios.get(`${API_BASE_URL}/api/rewards`, {
      params: { userId: selectedUser }
    })
      .then(res => {
        setCalcMessage(`Your current reward value is : ${res.data}`);
      })
      .catch(err => {
        console.error("Calculation failed", err);
        setCalcMessage("Failed to calculate reward.");
      });
  };

  const lavender = "#6B5B95";

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <h2 style={{
        fontSize: "2.5rem",
        fontWeight: "bold",
        marginBottom: "2rem",
        color: lavender,
        textAlign: "center"
      }}>
        Rewards
      </h2>

      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              marginRight: "1rem",
              border: "1px solid #ccc",
              borderRadius: "6px"
            }}
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.userId} value={user.userId}>{user.name}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              border: "1px solid #ccc",
              borderRadius: "6px"
            }}
          >
            <option value="">Select Month (MM-YYYY)</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        {rewardMessage && (
          <p style={{ color: "green", marginBottom: "1rem", fontSize: "1.1rem" }}>{rewardMessage}</p>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
            Reward Points Consumed:
          </label>
          <input
            type="number"
            value={rewardConsumed}
            onChange={(e) => setRewardConsumed(e.target.value)}
            placeholder="Enter numeric value"
            style={{
              padding: "0.5rem 1rem",
              width: "200px",
              marginRight: "1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
          />
          <button
            onClick={handleRewardConsumedSave}
            style={{
              backgroundColor: lavender,
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Save
          </button>
        </div>

        <div>
          <button
            onClick={handleCalculateNow}
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Calculate Now
          </button>
          {calcMessage && (
            <p style={{ marginTop: "1rem", color: "#333", fontWeight: "500" }}>{calcMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
