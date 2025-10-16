"use client";

import { useState } from "react";

export default function Reports() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function downloadReport(type: "excel" | "pdf") {
    try {
      setDownloading(type);
      const response = await fetch(`/api/reports?type=${type}`);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `coop-report.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Export Reports</h2>
        <p className="text-gray-600 mb-6">
          Download comprehensive reports of your cooperative data in various
          formats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-green-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Excel Report</h3>
            <p className="text-gray-600 mb-4">
              Download data in Excel format with multiple sheets.
            </p>
            <button
              onClick={() => downloadReport("excel")}
              disabled={downloading !== null}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {downloading === "excel" ? "Downloading..." : "Export Excel"}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">PDF Report</h3>
            <p className="text-gray-600 mb-4">
              Download a formatted PDF report of members and data.
            </p>
            <button
              onClick={() => downloadReport("pdf")}
              disabled={downloading !== null}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {downloading === "pdf" ? "Downloading..." : "Export PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
