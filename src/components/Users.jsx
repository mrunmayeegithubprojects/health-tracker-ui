import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", emailId: "", phoneNo: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get(`${API_BASE_URL}/api/users`).then((res) => setUsers(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dto = { ...form, status: "ACTIVE" };
    const res = await axios.post(`${API_BASE_URL}/api/users`, dto);
    setUsers([...users, res.data]);
    setForm({ name: "", emailId: "", phoneNo: "" });
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
      setUsers(users.filter((user) => user.userId !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  return (
    <div className="users-wrapper">
      <h2 className="users-heading">User Management</h2>

      {/* Create User Form */}
      <form onSubmit={handleSubmit} className="user-form">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="user-input"
          placeholder="Name"
          required
        />
        <input
          value={form.emailId}
          onChange={(e) => setForm({ ...form, emailId: e.target.value })}
          className="user-input"
          placeholder="Email"
          required
        />
        <input
          value={form.phoneNo}
          onChange={(e) => setForm({ ...form, phoneNo: e.target.value })}
          className="user-input"
          placeholder="Phone"
          required
        />
        <button type="submit" className="user-button">Create User</button>
      </form>

      {/* User List */}
      <div className="user-list">
        {users.map((user) => (
          <div key={user.userId} className="user-card">
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.emailId}</div>
            </div>
            <button onClick={() => deleteUser(user.userId)} className="delete-button">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
