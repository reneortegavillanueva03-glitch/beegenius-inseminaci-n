import { base44 } from "@/api/base44Client";

/**
 * Devuelve dónde está asignada una reina (colmena o núcleo), si ya lo está.
 * Ignora el contenedor que se está editando.
 */
export async function queenAssignment(queenCode, { hiveId, nucId, hiveCode, nucCode } = {}) {
  if (!queenCode) return null;

  const hivePage = await base44.entities.Hive.filter({ queenCode }, { limit: 50 });
  const hive = hivePage.items.find((item) => item.id !== hiveId);
  if (hive) return { container: "colmena", code: hive.code, location: hive.location };

  const nucPage = await base44.entities.MatingNuc.filter({ queenCode }, { limit: 50 });
  const nuc = nucPage.items.find((item) => item.id !== nucId);
  if (nuc) return { container: "núcleo", code: nuc.number, location: nuc.location };

  const queenPage = await base44.entities.Queen.filter({ code: queenCode }, { limit: 5 });
  const queen = queenPage.items[0];
  if (queen?.hiveCode && queen.hiveCode !== hiveCode) return { container: "colmena", code: queen.hiveCode };
  if (queen?.nucCode && queen.nucCode !== nucCode) return { container: "núcleo", code: queen.nucCode };

  return null;
}

export function assignmentMessage({ container, code, location }) {
  const target = container === "colmena" ? "la colmena" : "el núcleo";
  return `Reina agregada: ya está asignada a ${target} ${code}${location ? ` · ${location}` : ""}`;
}