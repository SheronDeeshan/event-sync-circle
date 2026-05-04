import type { EventItem } from "./mock-data";

const fmtICSDate = (d: string, t?: string) => {
  const date = new Date(`${d}T${t && /^\d{2}:\d{2}$/.test(t) ? t : "09:00"}:00`);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

export const downloadICS = (event: EventItem) => {
  const start = fmtICSDate(event.date, event.time);
  const endDateStr = event.endDate || event.date;
  const end = fmtICSDate(endDateStr, event.time);
  const uid = `${event.id}@circle.app`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Circle//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmtICSDate(new Date().toISOString().slice(0, 10))}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};
