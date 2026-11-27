function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cell(value) {
  if (value === null || value === undefined || value === "") return "<Cell/>";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function worksheet({ name, columns, rows }) {
  const header = `<Row>${columns
    .map((column) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(column)}</Data></Cell>`)
    .join("")}</Row>`;
  const body = rows.map((row) => `<Row>${row.map(cell).join("")}</Row>`).join("");
  return `<Worksheet ss:Name="${escapeXml(name).slice(0, 31)}"><Table>${header}${body}</Table></Worksheet>`;
}

// Descarga un libro de Excel (.xls) con una hoja por cada entrada de `sheets`.
export function exportSheetsToExcel(filename, sheets) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#ECEFF1" ss:Pattern="Solid"/></Style>
</Styles>
${sheets.map(worksheet).join("")}
</Workbook>`;

  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}