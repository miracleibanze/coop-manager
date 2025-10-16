"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ITransaction } from "@/models/Transaction";
import { IMember } from "@/models/Member";

interface TransactionFormData {
  type: "contribution" | "transfer" | "expense" | "sale";
  amount: number;
  note: string;
  fromMember?: string;
  toMember?: string;
}

export default function TransfersPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    type: "transfer",
    amount: 0,
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [transactionsRes, membersRes] = await Promise.all([
        axios.get<ITransaction[]>("/api/transfers"),
        axios.get<IMember[]>("/api/members"),
      ]);
      setTransactions(transactionsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function addTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.amount) return;

    try {
      setSubmitting(true);
      await axios.post("/api/transfers", {
        ...formData,
        amount: Number(formData.amount),
      });

      setFormData({ type: "transfer", amount: 0, note: "" });
      await fetchData();
    } catch (err) {
      console.error("Add transaction error:", err);
      setError("Failed to add transaction");
    } finally {
      setSubmitting(false);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "contribution":
        return "bg-green-100 text-green-800";
      case "sale":
        return "bg-blue-100 text-blue-800";
      case "expense":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Transactions & Transfers
        </h1>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Transactions & Transfers
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form
        onSubmit={addTransaction}
        className="bg-white p-6 rounded-lg shadow mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="transfer">Transfer</option>
            <option value="contribution">Contribution</option>
            <option value="expense">Expense</option>
            <option value="sale">Sale</option>
          </select>
          <input
            type="number"
            step="0.01"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="note"
            placeholder="Note"
            value={formData.note}
            onChange={handleInputChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {formData.type === "transfer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              name="fromMember"
              value={formData.fromMember || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">From Member (Optional)</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <select
              name="toMember"
              value={formData.toMember || ""}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">To Member (Optional)</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Transaction"}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From/To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.fromMember
                    ? (transaction.fromMember as any).name
                    : "N/A"}{" "}
                  →{" "}
                  {transaction.toMember
                    ? (transaction.toMember as any).name
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.note || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
