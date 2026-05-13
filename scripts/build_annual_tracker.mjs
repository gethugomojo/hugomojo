import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputPath = new URL("../downloads/hugomojo-annual-execution-tracker.xlsx", import.meta.url);
const previewDir = new URL("../tmp-tracker-preview/", import.meta.url);

const wb = Workbook.create();

const theme = {
  bg: "#0A0A0B",
  panel: "#151516",
  panel2: "#1F1F21",
  line: "#333335",
  gold: "#FFB300",
  gold2: "#CC8E00",
  text: "#F5F5F5",
  soft: "#B8B8BA",
  muted: "#6E6E72",
  green: "#32D583",
  red: "#F97066",
  blue: "#84CAFF",
};

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    const col = String.fromCharCode(65 + index);
    sheet.getRange(`${col}:${col}`).format.columnWidthPx = width;
  });
}

function baseSheet(sheet) {
  sheet.showGridLines = false;
  sheet.getRange("A:Z").format = {
    font: { name: "Inter", size: 10, color: theme.text },
    fill: theme.bg,
    verticalAlignment: "center",
  };
}

function brandHeader(sheet, title, subtitle) {
  sheet.getRange("A1:B3").merge();
  sheet.getRange("A1:B3").values = [["HM"]];
  sheet.getRange("A1:B3").format = {
    fill: theme.gold,
    font: { name: "Inter", size: 18, bold: true, color: theme.bg },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: theme.gold2 },
  };

  sheet.getRange("C1:L1").merge();
  sheet.getRange("C1:L1").values = [[title]];
  sheet.getRange("C1:L1").format = {
    fill: theme.bg,
    font: { name: "Inter", size: 18, bold: true, color: theme.text },
    verticalAlignment: "bottom",
  };

  sheet.getRange("C2:L2").merge();
  sheet.getRange("C2:L2").values = [[subtitle]];
  sheet.getRange("C2:L2").format = {
    fill: theme.bg,
    font: { name: "Inter", size: 10, color: theme.soft },
    verticalAlignment: "top",
  };

  sheet.getRange("A4:L4").format = {
    fill: theme.bg,
    borders: { preset: "bottom", style: "thin", color: theme.line },
  };
  sheet.getRange("A1:L4").format.rowHeightPx = 28;
}

function sectionTitle(sheet, range, title) {
  sheet.getRange(range).merge();
  sheet.getRange(range).values = [[title]];
  sheet.getRange(range).format = {
    fill: theme.bg,
    font: { name: "Inter", size: 11, bold: true, color: theme.gold },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
}

function card(sheet, range, label, formulaOrValue, note, accent = theme.gold) {
  const [start, end] = range.split(":");
  sheet.getRange(range).format = {
    fill: theme.panel,
    borders: { preset: "outside", style: "thin", color: theme.line },
    wrapText: true,
  };
  const row = Number(start.match(/\d+/)[0]);
  const col = start.replace(/\d+/, "");
  const valueCol = col.charCodeAt(0);
  const labelRange = `${col}${row}:${String.fromCharCode(valueCol + 2)}${row}`;
  const valueRange = `${col}${row + 1}:${String.fromCharCode(valueCol + 2)}${row + 1}`;
  const noteRange = `${col}${row + 2}:${String.fromCharCode(valueCol + 2)}${row + 2}`;
  sheet.getRange(labelRange).merge();
  sheet.getRange(valueRange).merge();
  sheet.getRange(noteRange).merge();
  sheet.getRange(labelRange).values = [[label]];
  if (formulaOrValue.startsWith("=")) {
    sheet.getRange(valueRange).formulas = [[formulaOrValue]];
  } else {
    sheet.getRange(valueRange).values = [[formulaOrValue]];
  }
  sheet.getRange(noteRange).values = [[note]];
  sheet.getRange(labelRange).format = {
    fill: theme.panel,
    font: { name: "Inter", size: 9, bold: true, color: accent },
  };
  sheet.getRange(valueRange).format = {
    fill: theme.panel,
    font: { name: "Inter", size: 20, bold: true, color: theme.text },
  };
  sheet.getRange(noteRange).format = {
    fill: theme.panel,
    font: { name: "Inter", size: 9, color: theme.soft },
  };
}

function headerRow(range) {
  range.format = {
    fill: theme.panel2,
    font: { name: "Inter", size: 10, bold: true, color: theme.text },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "all", style: "thin", color: theme.line },
    wrapText: true,
  };
}

function bodyRange(range) {
  range.format = {
    fill: theme.panel,
    font: { name: "Inter", size: 10, color: theme.text },
    verticalAlignment: "top",
    borders: { preset: "all", style: "thin", color: theme.line },
    wrapText: true,
  };
}

function addDashboard() {
  const sheet = wb.worksheets.add("Dashboard");
  baseSheet(sheet);
  setWidths(sheet, [70, 70, 90, 100, 110, 100, 110, 100, 112, 108, 96, 112]);
  brandHeader(
    sheet,
    "HugoMojo Annual Execution Tracker",
    "Member operating dashboard for weekly execution, market feedback, prompt versions, and quarterly calibration."
  );

  sectionTitle(sheet, "A6:L6", "Member Snapshot");
  card(sheet, "A8:C11", "LOGGED ACTIONS", '=COUNTIF(Execution!D7:D66,"<>")', "Every meaningful action you record.", theme.gold);
  card(sheet, "D8:F11", "COMPLETED", '=COUNTIF(Execution!J:J,"Done")', "Actions marked done.", theme.green);
  card(sheet, "G8:I11", "OPEN ITEMS", '=COUNTIF(Execution!J:J,"Planned")+COUNTIF(Execution!J:J,"In progress")', "Planned or active work.", theme.blue);
  card(sheet, "J8:L11", "FEEDBACK SIGNALS", '=COUNTIF(Execution!G7:G66,"<>")', "Replies, sales, calls, comments.", theme.gold);
  sheet.getRange("A8:L11").format.rowHeightPx = 26;

  sectionTitle(sheet, "A13:L13", "Path Mix");
  const mix = [
    ["Path", "Logged Actions", "Done", "Signal Notes"],
    ["Hunter", '=COUNTIF(Execution!B:B,"Hunter")', '=COUNTIFS(Execution!B:B,"Hunter",Execution!J:J,"Done")', '=COUNTIFS(Execution!B:B,"Hunter",Execution!G:G,"<>")'],
    ["Artisan", '=COUNTIF(Execution!B:B,"Artisan")', '=COUNTIFS(Execution!B:B,"Artisan",Execution!J:J,"Done")', '=COUNTIFS(Execution!B:B,"Artisan",Execution!G:G,"<>")'],
    ["Architect", '=COUNTIF(Execution!B:B,"Architect")', '=COUNTIFS(Execution!B:B,"Architect",Execution!J:J,"Done")', '=COUNTIFS(Execution!B:B,"Architect",Execution!G:G,"<>")'],
  ];
  sheet.getRange("A15:D18").values = mix.map((r) => r.map((v) => (String(v).startsWith("=") ? null : v)));
  sheet.getRange("B16:D18").formulas = mix.slice(1).map((r) => r.slice(1));
  headerRow(sheet.getRange("A15:D15"));
  bodyRange(sheet.getRange("A16:D18"));
  sheet.getRange("B16:D18").format.horizontalAlignment = "center";

  sectionTitle(sheet, "F13:L13", "How To Use This Workbook");
  const instructions = [
    ["1", "Log every real action. Do not log thoughts, only shipped work."],
    ["2", "Record market feedback. Replies, views, calls, sales, or silence all count."],
    ["3", "Track prompt versions. Update the version when the prompt changes."],
    ["4", "Review monthly. Pick the next smallest proof-of-demand test."],
  ];
  sheet.getRange("F15:L18").values = instructions.map(([n, text]) => [`${n}. ${text}`, "", "", "", "", "", ""]);
  bodyRange(sheet.getRange("F15:L18"));
  sheet.getRange("F15:L18").merge(true);

  sectionTitle(sheet, "A21:L21", "Monthly Operating Rule");
  sheet.getRange("A23:L25").merge();
  sheet.getRange("A23:L25").values = [["Choose one primary path for 30 days. Use the tracker to prove demand before switching. The goal is not to do more. The goal is to stop guessing."]];
  sheet.getRange("A23:L25").format = {
    fill: theme.panel,
    font: { name: "Inter", size: 12, bold: true, color: theme.text },
    borders: { preset: "outside", style: "thin", color: theme.gold2 },
    wrapText: true,
    verticalAlignment: "center",
  };
}

function addExecutionLog() {
  const sheet = wb.worksheets.add("Execution");
  baseSheet(sheet);
  setWidths(sheet, [96, 96, 116, 230, 170, 150, 190, 150, 88, 104, 190, 210]);
  brandHeader(sheet, "Execution Log", "Use this sheet as the source of truth for actions, feedback, prompt versions, and next steps.");
  const headers = ["Date", "Path", "Stage", "Action Taken", "Asset Used", "Prompt Version", "Market Feedback", "Result Metric", "Metric Value", "Status", "Next Action", "Notes"];
  sheet.getRange("A6:L6").values = [headers];
  headerRow(sheet.getRange("A6:L6"));
  const rows = [
    ["2026-05-12", "Hunter", "Outreach", "Sent 20 audit messages", "Audit offer draft", "Hunter-Audit-v1", "2 replies", "Reply rate", 10, "Done", "Rewrite offer opener", ""],
    ["2026-05-12", "Artisan", "Product", "Published first product page", "Mini guide page", "Artisan-Page-v1", "No sales yet", "Sales", 0, "In progress", "Improve headline", ""],
    ["2026-05-12", "Architect", "Consulting", "Booked one discovery call", "Workflow audit script", "Architect-Audit-v1", "Client has CRM issue", "Calls booked", 1, "Done", "Prepare proposal", ""],
  ];
  sheet.getRange("A7:L9").values = rows;
  bodyRange(sheet.getRange("A7:L66"));
  sheet.getRange("A7:A66").format.numberFormat = "yyyy-mm-dd";
  sheet.getRange("I7:I66").format.numberFormat = "0";
  sheet.getRange("A6:L66").format.autofitRows();
  sheet.freezePanes.freezeRows(6);
  sheet.getRange("B7:B66").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Hunter", "Artisan", "Architect"] } };
  sheet.getRange("C7:C66").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Outreach", "Product", "Consulting", "Delivery", "Review", "Signal"] } };
  sheet.getRange("J7:J66").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Planned", "In progress", "Done", "Blocked"] } };
  sheet.getRange("J7:J66").conditionalFormats.add("containsText", { text: "Done", format: { fill: "#123823", font: { color: theme.green, bold: true } } });
  sheet.getRange("J7:J66").conditionalFormats.add("containsText", { text: "Blocked", format: { fill: "#3B1414", font: { color: theme.red, bold: true } } });
}

function addMonthlyReview() {
  const sheet = wb.worksheets.add("Monthly Review");
  baseSheet(sheet);
  setWidths(sheet, [120, 140, 190, 220, 220, 200, 220, 220]);
  brandHeader(sheet, "Monthly Review", "Use once per month to turn activity into a decision.");
  const headers = ["Month", "Primary Path", "Completed Actions", "Best Signal", "Biggest Bottleneck", "Metric That Matters", "Next Month Focus", "Notes"];
  sheet.getRange("A6:H6").values = [headers];
  headerRow(sheet.getRange("A6:H6"));
  const rows = [
    ["2026-05", "Hunter", "Example: 45 outreach messages", "Example: 4 replies", "Offer is too broad", "Reply rate", "Narrow the offer", ""],
    ["2026-06", "", "", "", "", "", "", ""],
    ["2026-07", "", "", "", "", "", "", ""],
  ];
  sheet.getRange("A7:H18").values = [...rows, ...Array.from({ length: 9 }, () => ["", "", "", "", "", "", "", ""])];
  bodyRange(sheet.getRange("A7:H18"));
  sheet.getRange("B7:B18").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Hunter", "Artisan", "Architect"] } };
  sheet.freezePanes.freezeRows(6);
}

function addPromptVault() {
  const sheet = wb.worksheets.add("Prompt Vault");
  baseSheet(sheet);
  setWidths(sheet, [170, 94, 98, 200, 110, 110, 300]);
  brandHeader(sheet, "Prompt Vault", "Track the prompts you actually use, version, improve, and reuse.");
  const headers = ["Prompt Name", "Path", "Version", "Use Case", "Status", "Last Updated", "Notes"];
  sheet.getRange("A6:G6").values = [headers];
  headerRow(sheet.getRange("A6:G6"));
  const rows = [
    ["Offer Builder", "Hunter", "v1.0", "Turn skills into a small service offer", "Active", "2026-05-12", "Update after first 20 messages."],
    ["Product Page Builder", "Artisan", "v1.0", "Build a simple product page", "Testing", "2026-05-12", "Compare two headline angles."],
    ["Workflow Audit Mapper", "Architect", "v1.0", "Find automation points in a business process", "Active", "2026-05-12", "Use before proposal."],
  ];
  sheet.getRange("A7:G30").values = [...rows, ...Array.from({ length: 21 }, () => ["", "", "", "", "", "", ""])];
  bodyRange(sheet.getRange("A7:G30"));
  sheet.getRange("B7:B30").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Hunter", "Artisan", "Architect"] } };
  sheet.getRange("E7:E30").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Draft", "Testing", "Active", "Retired"] } };
  sheet.getRange("F7:F30").format.numberFormat = "yyyy-mm-dd";
  sheet.freezePanes.freezeRows(6);
}

function addQuarterlyCalibration() {
  const sheet = wb.worksheets.add("Quarterly Calibration");
  baseSheet(sheet);
  setWidths(sheet, [70, 320, 520, 120, 120, 120]);
  brandHeader(sheet, "Quarterly Calibration", "Use this page before each 90-day recalibration. Keep answers concrete.");
  const headers = ["#", "Question", "Your Answer", "Evidence", "Decision", "Owner"];
  sheet.getRange("A6:F6").values = [headers];
  headerRow(sheet.getRange("A6:F6"));
  const rows = [
    [1, "What path did you focus on for the last 30-90 days?", "", "", "", ""],
    [2, "What did you ship that a real person could react to?", "", "", "", ""],
    [3, "What market feedback did you receive?", "", "", "", ""],
    [4, "Where did execution slow down?", "", "", "", ""],
    [5, "What is the next smallest proof-of-demand test?", "", "", "", ""],
    [6, "Stay on the current path, adjust the offer, or switch path?", "", "", "", ""],
  ];
  sheet.getRange("A7:F12").values = rows;
  bodyRange(sheet.getRange("A7:F18"));
  sheet.getRange("E7:E18").dataValidation = { allowBlank: true, list: { inCellDropDown: true, source: ["Stay", "Adjust", "Switch", "Pause"] } };
  sheet.getRange("A7:F18").format.rowHeightPx = 56;
  sheet.freezePanes.freezeRows(6);
}

addDashboard();
addExecutionLog();
addMonthlyReview();
addPromptVault();
addQuarterlyCalibration();

const checks = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(checks.ndjson || "");

await fs.mkdir(previewDir, { recursive: true });
for (const [sheetName, range] of [
  ["Dashboard", "A1:L25"],
  ["Execution", "A1:L18"],
  ["Monthly Review", "A1:H14"],
  ["Prompt Vault", "A1:G14"],
  ["Quarterly Calibration", "A1:F14"],
]) {
  const rendered = await wb.render({ sheetName, range, scale: 1 });
  const buffer = Buffer.from(await rendered.arrayBuffer());
  await fs.writeFile(new URL(`${sheetName.replaceAll(" ", "-")}.png`, previewDir), buffer);
}

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputPath);
console.log(`Saved ${outputPath.pathname}`);
