"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import procurementData from "@/data/seed/procurement.json";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "institution" | "contractor";
  totalAmount: number;
  contractCount: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  amount: number;
  description: string;
}

function buildGraphData() {
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];

  for (const c of procurementData.contracts) {
    // Institution node
    if (!nodeMap.has(c.institution)) {
      nodeMap.set(c.institution, {
        id: c.institution,
        label: c.institution,
        type: "institution",
        totalAmount: 0,
        contractCount: 0,
      });
    }
    const inst = nodeMap.get(c.institution)!;
    inst.totalAmount += c.amount;
    inst.contractCount += 1;

    // Contractor node
    if (!nodeMap.has(c.contractorId)) {
      nodeMap.set(c.contractorId, {
        id: c.contractorId,
        label: c.contractor,
        type: "contractor",
        totalAmount: 0,
        contractCount: 0,
      });
    }
    const contractor = nodeMap.get(c.contractorId)!;
    contractor.totalAmount += c.amount;
    contractor.contractCount += 1;

    // Link
    links.push({
      source: c.institution,
      target: c.contractorId,
      amount: c.amount,
      description: c.description,
    });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export function RelationshipForceGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width: Math.max(width, 400), height: Math.min(width * 0.75, 700) });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { nodes, links } = buildGraphData();

    const maxAmount = Math.max(...nodes.map((n) => n.totalAmount));
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxAmount])
      .range([8, 35]);

    const linkWidthScale = d3
      .scaleSqrt()
      .domain([0, Math.max(...links.map((l) => l.amount))])
      .range([1, 8]);

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<GraphNode>().radius((d) => radiusScale(d.totalAmount) + 5));

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#94a3b8")
      .attr("d", "M0,-5L10,0L0,5");

    // Links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", (d) => linkWidthScale(d.amount))
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrow)");

    // Node groups
    const node = svg
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer");

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Draw shapes
    node.each(function (d) {
      const el = d3.select(this);
      const r = radiusScale(d.totalAmount);

      if (d.type === "institution") {
        el.append("rect")
          .attr("x", -r)
          .attr("y", -r)
          .attr("width", r * 2)
          .attr("height", r * 2)
          .attr("rx", 4)
          .attr("fill", "#2d5a8e")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
      } else {
        el.append("circle")
          .attr("r", r)
          .attr("fill", "#f5a623")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);
      }
    });

    // Labels
    node
      .append("text")
      .attr("dy", (d) => radiusScale(d.totalAmount) + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .attr("font-size", "10px")
      .attr("font-weight", (d) => (d.type === "institution" ? "600" : "400"))
      .text((d) => {
        const label = d.type === "institution" ? d.label : d.label.split(" ").slice(0, 2).join(" ");
        return label.length > 18 ? label.slice(0, 16) + "…" : label;
      });

    // Tooltip
    const tooltip = d3.select(tooltipRef.current);

    node
      .on("mouseover", function (event, d) {
        d3.select(this).select("circle, rect").attr("stroke-width", 4);

        // Highlight connected links
        link
          .attr("stroke", (l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            return src === d.id || tgt === d.id ? "#2d5a8e" : "#cbd5e1";
          })
          .attr("stroke-opacity", (l) => {
            const src = typeof l.source === "object" ? l.source.id : l.source;
            const tgt = typeof l.target === "object" ? l.target.id : l.target;
            return src === d.id || tgt === d.id ? 1 : 0.2;
          });

        const amtStr =
          d.totalAmount >= 1e9
            ? `₡${(d.totalAmount / 1e9).toFixed(1)}MM`
            : `₡${(d.totalAmount / 1e6).toFixed(0)}M`;

        tooltip
          .style("opacity", "1")
          .html(
            `<div class="font-semibold">${d.label}</div>
             <div class="text-xs" style="color: ${d.type === "institution" ? "#2d5a8e" : "#f5a623"}">${d.type === "institution" ? "Institución" : "Proveedor"}</div>
             <div class="text-xs mt-1">Monto total: <strong>${amtStr}</strong></div>
             <div class="text-xs">${d.contractCount} contrato${d.contractCount > 1 ? "s" : ""}</div>`
          );
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        tooltip.style("left", `${mx + 15}px`).style("top", `${my - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).select("circle, rect").attr("stroke-width", 2);
        link.attr("stroke", "#cbd5e1").attr("stroke-opacity", 0.6);
        tooltip.style("opacity", "0");
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" style={{ minHeight: "500px" }} />
      <div
        ref={tooltipRef}
        className="absolute bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none opacity-0 transition-opacity z-10 max-w-xs"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
