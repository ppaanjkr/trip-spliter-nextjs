import { NextRequest, NextResponse } from "next/server";

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStartDate() {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
    }),
  );

  if (now.getHours() < 18) {
    now.setDate(now.getDate() - 1);
  }

  return now;
}

export async function GET(req: NextRequest) {
  try {
    const currency = req.nextUrl.searchParams.get("currency")?.toUpperCase();

    if (!currency || currency === "THB") {
      return NextResponse.json({
        success: true,
        currency: "THB",
        rate: 1,
      });
    }

    const BOT_API = process.env.BOT_API;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_API || !BOT_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Missing BOT_API or BOT_TOKEN" },
        { status: 500 },
      );
    }

    const targetDate = getStartDate();

    for (let i = 0; i < 7; i++) {
      const dateStr = formatDate(targetDate);

      const url = `${BOT_API}?start_period=${dateStr}&end_period=${dateStr}&currency=${currency}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${BOT_TOKEN}`,
        },
        cache: "no-store",
      });

      const data = await res.json();
      console.log(data);

      const detail = data?.result?.data?.data_detail?.[0];
      const midRate = detail?.mid_rate;

      if (midRate) {
        return NextResponse.json({
          success: true,
          currency,
          rate: Number(midRate),
          period: detail.period || dateStr,
        });
      }

      targetDate.setDate(targetDate.getDate() - 1);
    }

    return NextResponse.json(
      { success: false, message: "Exchange rate not found" },
      { status: 404 },
    );
  } catch (err) {
    console.error("GET /api/exchange-rate error", err);

    return NextResponse.json(
      { success: false, message: "Failed to get exchange rate" },
      { status: 500 },
    );
  }
}