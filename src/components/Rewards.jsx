import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Rewards() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [rewardMessage, setRewardMessage] = useState("");
  const [rewardConsumed, setRewardConsumed] = useState("");
  const [calcMessage, setCalcMessage] = useState("");

  // 📅 Generate past 6 months in MM-YYYY format (excluding current month always)
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

  // 👥 Fetch active users
  useEffect(() => {
    axios.get("http://localhost:8080/api/users")
      .then(res => {
        const activeUsers = res.data.filter(user => user.status?.toLowerCase() === "active");
        setUsers(activeUsers);
      })
      .catch(err => console.error("Failed to fetch users", err));
  }, []);

  // 📥 Fetch or create reward entry
  useEffect(() => {
    if (!selectedUser || !selectedMonth) return;

    setRewardMessage("Fetching reward...");

    axios.get("http://localhost:8080/api/rewards", {
      params: {
        userId: selectedUser,
        monYear: selectedMonth // 👈 changed from 'key' to 'monYear'
      }
    })
      .then(res => {
        const val = res.data;
        if (val === null || val === "" || typeof val === "undefined") {
          // Not found → create reward entry
          axios.post("http://localhost:8080/api/rewards", {
            userId: selectedUser,
            key: selectedMonth // 👈 backend expects 'key' in request body
          })
            .then(() => {
              // Re-fetch after creating
              return axios.get("http://localhost:8080/api/rewards", {
                params: {
                  userId: selectedUser,
                  monYear: selectedMonth
                }
              });
            })
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

    axios.post("http://localhost:8080/api/rewards", {
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

    axios.get("http://localhost:8080/api/rewards", {
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Rewards</h2>

      {/* 👤 User Dropdown */}
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="border p-2 mr-4"
      >
        <option value="">Select User</option>
        {users.map(user => (
          <option key={user.userId} value={user.userId}>
            {user.name}
          </option>
        ))}
      </select>

      {/* 🗓️ Month Dropdown */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="border p-2"
      >
        <option value="">Select Duration (MM-YYYY)</option>
        {availableMonths.map(month => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>

      {/* 🎯 Reward Message */}
      {rewardMessage && (
        <p className="mt-4 text-green-700">{rewardMessage}</p>
      )}

      {/* 🧾 Reward Consumed */}
      <div className="mt-6">
        <label className="block mb-1 font-semibold">Reward Points Consumed:</label>
        <input
          type="number"
          value={rewardConsumed}
          onChange={(e) => setRewardConsumed(e.target.value)}
          className="border p-2 w-64 mr-2"
          placeholder="Enter numeric value"
        />
        <button
          onClick={handleRewardConsumedSave}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>

      {/* 📊 Calculate Button */}
      <div className="mt-6">
        <button
          onClick={handleCalculateNow}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Calculate Now
        </button>
        {calcMessage && (
          <p className="mt-2 text-indigo-700">{calcMessage}</p>
        )}
      </div>
    </div>
  );
}