import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { exportSheetsToExcel } from "@/lib/exportExcel";
import { QUEEN_STATUS, RESULT } from "@/lib/labels";

const PAGE = 500;

async function fetchAll(entity) {
  const records = [];
  let cursor;
  for (let i = 0; i < 20; i += 1) {
    const page = await entity.list({ sort: "-created_date", limit: PAGE, ...(cursor ? { cursor } : {}) });
    records.push(...(page.items ?? []));
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return records;
}

const label = (dictionary, value) => (value ? dictionary[value]?.label ?? value : "");

const INSEMINATION_COLUMNS = [
  "Fecha",
  "Reina",
  "Línea",
  "Línea de zánganos",
  "Origen de zánganos",
  "Zánganos",
  "Semen (µl)",
  "CO₂ (min)",
  "Técnico",
  "Resultado",
  "Inicio de postura",
  "Notas",
];

const QUEEN_COLUMNS = [
  "Código",
  "Línea",
  "Apiario",
  "Estado",
  "Traslarve",
  "Nacimiento",
  "Enjaulado",
  "Reina madre",
  "Núcleo",
  "Colmena",
  "Inseminación",
  "Inicio de postura",
  "Notas",
];

const inseminationRow = (item) => [
  item.date,
  item.queenCode,
  item.line,
  item.droneLine,
  item.droneOrigin,
  item.droneCount,
  item.semenVolume,
  item.co2Minutes,
  item.technician,
  label(RESULT, item.result),
  item.layingDate,
  item.notes,
];

const queenRow = (item) => [
  item.code,
  item.line,
  item.apiary,
  label(QUEEN_STATUS, item.status),
  item.graftDate,
  item.emergenceDate,
  item.cageDate,
  item.motherCode,
  item.nucCode,
  item.hiveCode,
  item.inseminationDate,
  item.layingDate,
  item.notes,
];

export default function ExportExcelButton() {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const [inseminations, queens] = await Promise.all([
        fetchAll(base44.entities.Insemination),
        fetchAll(base44.entities.Queen),
      ]);
      exportSheetsToExcel(`Apiario-inseminaciones-reinas-${new Date().toISOString().slice(0, 10)}`, [
        { name: "Inseminaciones", columns: INSEMINATION_COLUMNS, rows: inseminations.map(inseminationRow) },
        { name: "Reinas", columns: QUEEN_COLUMNS, rows: queens.map(queenRow) },
      ]);
      toast.success(`Excel generado: ${inseminations.length} inseminaciones y ${queens.length} reinas.`);
    } catch {
      toast.error("No se pudo generar el archivo. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {busy ? "Generando…" : "Exportar a Excel"}
    </Button>
  );
}