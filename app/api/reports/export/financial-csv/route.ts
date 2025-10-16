// app/api/reports/export/financial-csv/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Parser } from "json2csv";

/**
 * POST /api/reports/export/financial-csv
 * Secure route to generate and export financial report as CSV.
 *
 * Request body example:
 * { "dateRange": { "start": "2024-01-01", "end": "2024-05-31" } }
 */
export async function POST(request: Request) {
  try {
    // 🔒 Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🧾 Parse request body
    const body = await request.json().catch(() => ({}));
    const { dateRange } = body || {};

    // 🧮 Simulated database records
    const data = [
      {
        month: "January 2024",
        contributions: 2000,
        expenses: 800,
        loans: 1500,
        netBalance: 1200,
      },
      {
        month: "February 2024",
        contributions: 2500,
        expenses: 900,
        loans: 1800,
        netBalance: 1600,
      },
      {
        month: "March 2024",
        contributions: 2200,
        expenses: 850,
        loans: 1200,
        netBalance: 1350,
      },
      {
        month: "April 2024",
        contributions: 2800,
        expenses: 950,
        loans: 2000,
        netBalance: 1850,
      },
      {
        month: "May 2024",
        contributions: 2500,
        expenses: 1000,
        loans: 1700,
        netBalance: 1500,
      },
    ];

    // 🗓️ Optional date range filter (if dates provided)
    let filteredData = data;
    if (dateRange?.start && dateRange?.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filteredData = data.filter((item) => {
        const itemDate = new Date(item.month + " 01"); // rough conversion for demo
        return itemDate >= start && itemDate <= end;
      });
    }

    if (!filteredData.length) {
      return NextResponse.json(
        { message: "No records found for given range." },
        { status: 404 }
      );
    }

    // 🪶 Define CSV fields
    const fields = [
      { label: "Month", value: "month" },
      { label: "Contributions ($)", value: "contributions" },
      { label: "Expenses ($)", value: "expenses" },
      { label: "Loans Disbursed ($)", value: "loans" },
      { label: "Net Balance ($)", value: "netBalance" },
    ];

    // 🧰 Convert to CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(filteredData);

    // 🕓 File name timestamp
    const filename = `financial-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // 📤 Return downloadable CSV
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
