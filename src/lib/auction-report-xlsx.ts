import type { AuctionReport } from "./auction-report.functions";

const GOLD = "FFD4AF37";
const MONEY = '"L." #,##0';

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" });
}

export async function downloadAuctionReport(report: AuctionReport) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Capítulo Daga de Obsidiana";
  wb.created = new Date();

  function styleHeader(ws: import("exceljs").Worksheet) {
    const row = ws.getRow(1);
    row.font = { bold: true, name: "Arial", size: 11 };
    row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
    row.alignment = { vertical: "middle" };
    row.height = 22;
    ws.views = [{ state: "frozen", ySplit: 1 }];
  }

  // Hoja 1 — Ganadores
  const w = wb.addWorksheet("Ganadores");
  w.columns = [
    { header: "Lote", key: "lote", width: 8 },
    { header: "Artículo", key: "title", width: 40 },
    { header: "Precio base (L.)", key: "base", width: 16, style: { numFmt: MONEY } },
    { header: "Ganador", key: "name", width: 28 },
    { header: "Logia", key: "logia", width: 26 },
    { header: "Correo", key: "email", width: 30 },
    { header: "Celular", key: "phone", width: 16 },
    { header: "Monto ganador (L.)", key: "amount", width: 18, style: { numFmt: MONEY } },
    { header: "Fecha de la puja", key: "date", width: 20 },
    { header: "Pujas recibidas", key: "count", width: 16 },
  ];
  for (const it of report.winners) {
    w.addRow({
      lote: it.lote,
      title: it.title,
      base: it.startingPrice,
      name: it.bidderName ?? "Sin pujas",
      logia: it.bidderLogia ?? "",
      email: it.email ?? "",
      phone: it.phone ?? "",
      amount: it.amount ?? "",
      date: fmtDate(it.createdAt),
      count: it.totalBids,
    });
  }
  styleHeader(w);

  // Hoja 2 — Todas las pujas
  const b = wb.addWorksheet("Todas las pujas");
  b.columns = [
    { header: "Lote", key: "lote", width: 8 },
    { header: "Artículo", key: "title", width: 40 },
    { header: "Pujante", key: "name", width: 28 },
    { header: "Logia", key: "logia", width: 26 },
    { header: "Correo", key: "email", width: 30 },
    { header: "Celular", key: "phone", width: 16 },
    { header: "Monto (L.)", key: "amount", width: 14, style: { numFmt: MONEY } },
    { header: "Fecha", key: "date", width: 20 },
  ];
  for (const it of report.bids) {
    b.addRow({
      lote: it.lote,
      title: it.title,
      name: it.bidderName,
      logia: it.bidderLogia,
      email: it.email,
      phone: it.phone,
      amount: it.amount,
      date: fmtDate(it.createdAt),
    });
  }
  styleHeader(b);

  // Hoja 3 — Resumen
  const s = wb.addWorksheet("Resumen");
  s.columns = [
    { header: "Concepto", key: "k", width: 34 },
    { header: "Valor", key: "v", width: 26 },
  ];
  s.addRow({ k: "Total recaudado (L.)", v: report.summary.totalRaised }).getCell("v").numFmt = MONEY;
  s.addRow({ k: "Lotes vendidos", v: report.summary.itemsSold });
  s.addRow({ k: "Lotes sin pujas", v: report.summary.itemsWithoutBids });
  s.addRow({ k: "Pujantes únicos", v: report.summary.uniqueBidders });
  s.addRow({ k: "Total de pujas", v: report.summary.totalBids });
  s.addRow({ k: "Informe generado", v: fmtDate(report.summary.generatedAt) });
  styleHeader(s);

  wb.eachSheet((ws) => {
    ws.eachRow((row) => {
      row.eachCell((cell) => {
        if (!cell.font?.bold) cell.font = { name: "Arial", size: 10 };
      });
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const date = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `subasta-daga-obsidiana-informe-${date}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
