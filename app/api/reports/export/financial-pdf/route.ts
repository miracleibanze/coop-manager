// app/api/reports/export/financial-pdf/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PDFDocument from "pdfkit";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dateRange } = body;

    // Create a PDF document
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {});

    // Add content to PDF
    doc.fontSize(20).text("Financial Summary Report", { align: "center" });
    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        `Date Range: ${new Date(
          dateRange.start
        ).toLocaleDateString()} - ${new Date(
          dateRange.end
        ).toLocaleDateString()}`
      );
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Add summary section
    doc.fontSize(16).text("Summary", { underline: true });
    doc.moveDown();

    // This would be populated with actual data from your database
    doc.text("Total Contributions: $10,000.00");
    doc.text("Total Expenses: $4,500.00");
    doc.text("Net Balance: $5,500.00");
    doc.text("Growth Rate: 12.5%");
    doc.moveDown();

    // Add monthly breakdown
    doc.fontSize(16).text("Monthly Breakdown", { underline: true });
    doc.moveDown();

    // Example table data
    const tableData = [
      ["Month", "Contributions", "Expenses", "Net Balance"],
      ["Jan 2024", "$2,000.00", "$800.00", "$1,200.00"],
      ["Feb 2024", "$2,500.00", "$900.00", "$1,600.00"],
      ["Mar 2024", "$2,200.00", "$850.00", "$1,350.00"],
      ["Apr 2024", "$2,800.00", "$950.00", "$1,850.00"],
      ["May 2024", "$2,500.00", "$1,000.00", "$1,500.00"],
    ];

    // Simple table implementation
    tableData.forEach((row, index) => {
      if (index === 0) {
        doc.font("Helvetica-Bold");
      } else {
        doc.font("Helvetica");
      }
      doc.text(row.join(" | "));
    });

    doc.end();

    // Wait for PDF to be generated
    await new Promise<void>((resolve) => {
      doc.on("end", resolve);
    });

    const pdfBuffer = Buffer.concat(chunks);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="financial-report-${
          new Date().toISOString().split("T")[0]
        }.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
