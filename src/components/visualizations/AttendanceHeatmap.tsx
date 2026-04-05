"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface AttendanceDay {
  date: string;
  present: boolean;
}

// Generate sample attendance data for a year
function generateAttendanceData(
  attendanceRate: number,
  year: number = 2025
): AttendanceDay[] {
  const data: AttendanceDay[] = [];
  const rng = seedRandom(attendanceRate * 100);

  // Legislative sessions are typically Mon-Thu
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    // Skip weekends and assume sessions Mon-Thu
    if (day >= 1 && day <= 4) {
      // Skip January (recess) and Holy Week (late March/early April)
      const month = d.getMonth();
      if (month === 0) continue; // Recess
      const dateStr = d.toISOString().split("T")[0];
      data.push({
        date: dateStr,
        present: rng() < attendanceRate / 100,
      });
    }
  }
  return data;
}

// Simple seeded random for reproducible data
function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function AttendanceHeatmap({
  attendanceRate,
  year = 2025,
}: {
  attendanceRate: number;
  year?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const data = generateAttendanceData(attendanceRate, year);

  useEffect(() => {
    if (!svgRef.current) return;

    const cellSize = 14;
    const gap = 2;
    const marginLeft = 30;
    const marginTop = 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];

    // Group data by week
    const parseDate = (s: string) => new Date(s + "T12:00:00");

    const width = marginLeft + 53 * (cellSize + gap);
    const height = marginTop + 7 * (cellSize + gap) + 10;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Month labels
    for (let m = 0; m < 12; m++) {
      const firstDay = new Date(year, m, 1);
      const week = d3.timeWeek.count(new Date(year, 0, 1), firstDay);
      svg
        .append("text")
        .attr("x", marginLeft + week * (cellSize + gap))
        .attr("y", 12)
        .attr("fill", "currentColor")
        .attr("font-size", "9px")
        .attr("class", "text-muted")
        .text(months[m]);
    }

    // Day labels
    const dayLabels = ["", "L", "", "M", "", "V", ""];
    dayLabels.forEach((label, i) => {
      if (!label) return;
      svg
        .append("text")
        .attr("x", marginLeft - 6)
        .attr("y", marginTop + i * (cellSize + gap) + cellSize / 2 + 3)
        .attr("text-anchor", "end")
        .attr("fill", "currentColor")
        .attr("font-size", "9px")
        .attr("class", "text-muted")
        .text(label);
    });

    // Create a map for quick lookup
    const dataMap = new Map(data.map((d) => [d.date, d.present]));

    // Draw cells for every day of the year
    const startOfYear = new Date(year, 0, 1);

    for (let dayOffset = 0; dayOffset < 366; dayOffset++) {
      const date = new Date(year, 0, 1 + dayOffset);
      if (date.getFullYear() !== year) break;

      const dayOfWeek = date.getDay(); // 0=Sun
      const week = d3.timeWeek.count(startOfYear, date);
      const dateStr = date.toISOString().split("T")[0];

      const isSession = dataMap.has(dateStr);
      const isPresent = dataMap.get(dateStr);

      let fill: string;
      if (!isSession) {
        fill = "#f1f5f9"; // no session (weekend/recess)
      } else if (isPresent) {
        fill = "#22c55e"; // present
      } else {
        fill = "#ef4444"; // absent
      }

      svg
        .append("rect")
        .attr("x", marginLeft + week * (cellSize + gap))
        .attr("y", marginTop + dayOfWeek * (cellSize + gap))
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 2)
        .attr("fill", fill)
        .attr("opacity", isSession ? 1 : 0.3)
        .append("title")
        .text(
          isSession
            ? `${dateStr}: ${isPresent ? "Presente" : "Ausente"}`
            : `${dateStr}: Sin sesión`
        );
    }
  }, [data, year, attendanceRate]);

  return (
    <div>
      <svg ref={svgRef} className="w-full" style={{ maxHeight: "140px" }} />
      <div className="flex gap-4 justify-center mt-2 text-xs text-muted">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
          Presente
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
          Ausente
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" />
          Sin sesión
        </div>
      </div>
    </div>
  );
}
