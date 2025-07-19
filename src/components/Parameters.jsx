import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

export default function Parameters() {
  const [parameters, setParameters] = useState([]);
  const [form, setForm] = useState({
    paramName: "",
    trackingFrequency: "DAILY",
    doneValue: "",
    notDoneValue: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = () => {
    axios.get(`${API_BASE_URL}/api/parameters`).then((res) => setParameters(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dto = {
      ...form,
      doneValue: parseInt(form.doneValue),
      notDoneValue: parseInt(form.notDoneValue),
    };

    if (editingId) {
      await axios.put(`${API_BASE_URL}/api/parameters/${editingId}`, dto);
      setEditingId(null);
    } else {
      await axios.post(`${API_BASE_URL}/api/parameters`, dto);
    }

    setForm({ paramName: "", trackingFrequency: "DAILY", doneValue: "", notDoneValue: "" });
    fetchParameters();
  };

  const deleteParameter = async (paramId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/parameters/${paramId}`);
      setParameters(parameters.filter((p) => p.paramId !== paramId));
    } catch (err) {
      console.error("Failed to delete parameter:", err);
    }
  };

  const startEdit = (param) => {
    setEditingId(param.paramId);
    setForm({
      paramName: param.paramName,
      trackingFrequency: param.trackingFrequency,
      doneValue: param.doneValue,
      notDoneValue: param.notDoneValue,
    });
  };

  return (
    <div className="parameters-wrapper">
      <h2 className="parameters-heading">
        {editingId ? "Edit Parameter" : "Growth Parameters"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="parameter-form">
        <input
          value={form.paramName}
          onChange={(e) => setForm({ ...form, paramName: e.target.value })}
          className="parameter-input"
          placeholder="Parameter Name"
          required
        />
        <select
          value={form.trackingFrequency}
          onChange={(e) => setForm({ ...form, trackingFrequency: e.target.value })}
          className="parameter-input"
        >
          <option value="DAILY">DAILY</option>
          <option value="MONTHLY">MONTHLY</option>
        </select>
        <input
          value={form.doneValue}
          onChange={(e) => setForm({ ...form, doneValue: e.target.value })}
          type="number"
          className="parameter-input"
          placeholder="Done Value"
          required
        />
        <input
          value={form.notDoneValue}
          onChange={(e) => setForm({ ...form, notDoneValue: e.target.value })}
          type="number"
          className="parameter-input"
          placeholder="Not Done Value"
          required
        />
        <button type="submit" className="parameter-button">
          {editingId ? "Update" : "Create"} Parameter
        </button>
      </form>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name..."
        className="parameter-input"
        style={{ marginBottom: "16px" }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* List */}
      <div className="parameter-list">
        {parameters
          .filter((param) =>
            param.paramName.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((param) => (
            <div key={param.paramId} className="parameter-card">
              <div className="parameter-info">
                <div className="parameter-name">{param.paramName}</div>
                <div className="parameter-meta">({param.trackingFrequency})</div>
              </div>
              <div className="parameter-actions">
                <button onClick={() => startEdit(param)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => deleteParameter(param.paramId)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
