"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { IInventoryItem } from "@/models/InventoryItem";

interface InventoryFormData {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  sku: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    name: "",
    quantity: 0,
    unit: "",
    cost: 0,
    sku: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      const response = await axios.get<IInventoryItem[]>("/api/inventory");
      setItems(response.data);
    } catch (err) {
      console.error("Inventory fetch error:", err);
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      await axios.post("/api/inventory", {
        ...formData,
        quantity: Number(formData.quantity),
        cost: Number(formData.cost),
      });

      setFormData({ name: "", quantity: 0, unit: "", cost: 0, sku: "" });
      await fetchInventory();
    } catch (err) {
      console.error("Add item error:", err);
      setError("Failed to add item");
    } finally {
      setSubmitting(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "cost" ? Number(value) : value,
    }));
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={addItem} className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name *"
            value={formData.name}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="unit"
            placeholder="Unit (kg, pcs, etc)"
            value={formData.unit}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            name="cost"
            placeholder="Cost"
            value={formData.cost}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="text"
          name="sku"
          placeholder="SKU (Optional)"
          value={formData.sku}
          onChange={handleInputChange}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4 w-full md:w-1/2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Item"}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.sku || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.unit || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${item.cost?.toFixed(2) || "0.00"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
