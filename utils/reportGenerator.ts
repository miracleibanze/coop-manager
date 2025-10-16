import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { IMember } from "@/models/Member";
import { ITransaction } from "@/models/Transaction";
import { IInventoryItem } from "@/models/InventoryItem";

interface ReportData {
  members: IMember[];
  transactions: ITransaction[];
  inventory: IInventoryItem[];
}

interface PdfReportOptions {
  title?: string;
  members: IMember[];
}

export async function buildExcelReport({
  members,
  transactions,
  inventory,
}: ReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();

  // Members sheet
  const ws = wb.addWorksheet("Members");
  ws.addRow(["Name", "Email", "Phone", "Joined", "Share%"]);
  members.forEach((m) =>
    ws.addRow([
      m.name,
      m.email,
      m.phone,
      m.joinDate?.toISOString(),
      m.totalContributions,
    ])
  );

  // Transactions sheet
  const transWs = wb.addWorksheet("Transactions");
  transWs.addRow(["Type", "Amount", "From", "To", "Date", "Note"]);
  transactions.forEach((t) =>
    transWs.addRow([
      t.type,
      t.amount,
      (t.fromMember as any)?.name || "N/A",
      (t.toMember as any)?.name || "N/A",
      t.date?.toISOString(),
      t.note,
    ])
  );

  // Inventory sheet
  const invWs = wb.addWorksheet("Inventory");
  invWs.addRow(["Name", "SKU", "Quantity", "Unit", "Cost"]);
  inventory.forEach((i) =>
    invWs.addRow([i.name, i.sku, i.quantity, i.unit, i.cost])
  );

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export function buildPdfReportStream({
  title = "Report",
  members,
}: PdfReportOptions): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        const doc = new PDFDocument();

        // Pipe PDFDocument to the stream controller
        doc.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        doc.on("end", () => {
          controller.close();
        });

        doc.on("error", (error) => {
          controller.error(error);
        });

        // Create PDF content
        doc.fontSize(18).text(title, { align: "center" });
        doc.moveDown();
        doc.fontSize(12);

        members.forEach((m) => {
          doc.text(
            `${m.name} — ${m.email || "No email"} — Phone: ${
              m.phone || "N/A"
            } — Share: ${m.totalContributions}`
          );
          doc.moveDown(0.5);
        });

        doc.end();
      } catch (error) {
        controller.error(error);
      }
    },

    cancel() {
      // Clean up if the stream is cancelled
      console.log("PDF generation stream was cancelled");
    },
  });
}
