import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import Transaction from "@/models/Transaction";
import InventoryItem from "@/models/InventoryItem";
import {
  buildExcelReport,
  buildPdfReportStream,
} from "@/utils/reportGenerator";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "excel";
    const month = searchParams.get("month");

    await connectDB();

    const members = await Member.find();
    const transactions = await Transaction.find({
      cooperativeId: new Types.ObjectId(session.user.cooperativeId),
    })
      .populate("fromMember toMember")
      .exec();

    const inventory = await InventoryItem.find({
      cooperativeId: new Types.ObjectId(session.user.cooperativeId),
    }).exec();

    if (type === "excel") {
      try {
        const buffer = await buildExcelReport({
          members,
          transactions,
          inventory,
        });

        // Convert Buffer to Uint8Array for NextResponse
        const uint8Array = new Uint8Array(buffer);

        return new NextResponse(uint8Array, {
          status: 200,
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": 'attachment; filename="coop-report.xlsx"',
          },
        });
      } catch (error) {
        console.error("Excel generation error:", error);
        return NextResponse.json(
          { error: "Failed to generate Excel report" },
          { status: 500 }
        );
      }
    }

    if (type === "pdf") {
      try {
        const pdfStream = buildPdfReportStream({
          title: "Cooperative Report",
          members,
        });

        return new Response(pdfStream, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="coop-report.pdf"',
          },
        });
      } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
          { error: "Failed to generate PDF report" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
