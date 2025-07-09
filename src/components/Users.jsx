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
    <div>
      <h2 className="text-xl font-semibold mb-2">Users</h2>

      {/* Create User Form */}
      <form className="space-y-2 mb-4" onSubmit={handleSubmit}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-1" placeholder="Name" required />
        <input value={form.emailId} onChange={(e) => setForm({ ...form, emailId: e.target.value })} className="border p-1" placeholder="Email" required />
        <input value={form.phoneNo} onChange={(e) => setForm({ ...form, phoneNo: e.target.value })} className="border p-1" placeholder="Phone" required />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1">Create User</button>
      </form>

      {/* User List */}
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.userId} className="flex justify-between items-center border p-2">
            <div>
              <strong>{user.name}</strong> - {user.emailId}
            </div>
            <button
              onClick={() => deleteUser(user.userId)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}