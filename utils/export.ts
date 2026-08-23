export function downloadExcelTable(fileName: string, headings: readonly string[], rows: readonly (readonly (string | number | boolean)[])[]) {
  const content = [headings, ...rows].map((row) => row.map((cell) => String(cell).replaceAll("\t", " ")).join("\t")).join("\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${content}`], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
