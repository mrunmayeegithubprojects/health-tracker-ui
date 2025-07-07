import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Parameters() {
  const [parameters, setParameters] = useState([]);
  const [form, setForm] = useState({ paramName: "", trackingFrequency: "DAILY", doneValue: "", notDoneValue: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = () => {
    axios.get("http://localhost:8080/api/parameters").then((res) => setParameters(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dto = {
      ...form,
      doneValue: parseInt(form.doneValue),
      notDoneValue: parseInt(form.notDoneValue),
    };

    if (editingId) {
      await axios.put(`http://localhost:8080/api/parameters/${editingId}`, dto);
      setEditingId(null);
    } else {
      await axios.post("http://localhost:8080/api/parameters", dto);
    }

    setForm({ paramName: "", trackingFrequency: "DAILY", doneValue: "", notDoneValue: "" });
    fetchParameters();
  };

  const deleteParameter = async (paramId) => {
    try {
      await axios.delete(`http://localhost:8080/api/parameters/${paramId}`);
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
    <div>
      <h2 className="text-xl font-semibold mb-2">
        {editingId ? "Edit Parameter" : "Parameters"}
      </h2>

      {/* Create/Edit Form */}
      <form className="space-y-2 mb-4" onSubmit={handleSubmit}>
        <input
          value={form.paramName}
          onChange={(e) => setForm({ ...form, paramName: e.target.value })}
          className="border p-1"
          placeholder="Parameter Name"
          required
        />
        <select
          value={form.trackingFrequency}
          onChange={(e) => setForm({ ...form, trackingFrequency: e.target.value })}
          className="border p-1"
        >
          <option value="DAILY">DAILY</option>
          <option value="MONTHLY">MONTHLY</option>
        </select>
        <input
          value={form.doneValue}
          onChange={(e) => setForm({ ...form, doneValue: e.target.value })}
          type="number"
          className="border p-1"
          placeholder="Done Value"
          required
        />
        <input
          value={form.notDoneValue}
          onChange={(e) => setForm({ ...form, notDoneValue: e.target.value })}
          type="number"
          className="border p-1"
          placeholder="Not Done Value"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-2 py-1">
          {editingId ? "Update" : "Create"} Parameter
        </button>
      </form>

      {/* List */}
      <ul className="space-y-2">
        {parameters.map((param) => (
          <li key={param.paramId} className="flex justify-between items-center border p-2">
            <div>
              <strong>{param.paramName}</strong> ({param.trackingFrequency})
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(param)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteParameter(param.paramId)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}