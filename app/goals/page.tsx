"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { IGoal } from "@/models/Goal";

interface GoalFormData {
  title: string;
  description: string;
  targetNumber: number;
  dueDate: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    description: "",
    targetNumber: 0,
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      setLoading(true);
      const response = await axios.get<IGoal[]>("/api/goals");
      setGoals(response.data);
    } catch (err) {
      console.error("Goals fetch error:", err);
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      await axios.post("/api/goals", {
        ...formData,
        targetNumber: Number(formData.targetNumber),
        dueDate: formData.dueDate || undefined,
      });

      setFormData({ title: "", description: "", targetNumber: 0, dueDate: "" });
      await fetchGoals();
    } catch (err) {
      console.error("Add goal error:", err);
      setError("Failed to add goal");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateGoalProgress(goalId: string, increment: number) {
    try {
      await axios.put(`/api/goals/${goalId}`, { inc: increment });
      await fetchGoals();
    } catch (err) {
      console.error("Update goal error:", err);
      setError("Failed to update goal progress");
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "targetNumber" ? Number(value) : value,
    }));
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Goals</h1>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Goals</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={addGoal} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="title"
            placeholder="Goal Title *"
            value={formData.title}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="targetNumber"
            placeholder="Target Number"
            value={formData.targetNumber}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Goal"}
        </button>
      </form>

      <div className="grid gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentNumber / goal.targetNumber) * 100;
          const isComplete = goal.currentNumber >= goal.targetNumber;

          return (
            <div key={goal._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-gray-600 mt-1">{goal.description}</p>
                  )}
                  {goal.dueDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {new Date(goal.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    goal.status === "open"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    Progress: {goal.currentNumber} / {goal.targetNumber}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      isComplete ? "bg-green-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => updateGoalProgress(goal._id, 1)}
                  disabled={isComplete}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  +1
                </button>
                <button
                  onClick={() => updateGoalProgress(goal._id, -1)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  -1
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
