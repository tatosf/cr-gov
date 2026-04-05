"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import institutionsData from "@/data/seed/institutions.json";
import officialsData from "@/data/seed/officials.json";
import type { Institution, Official } from "@/lib/types/institutions";
import { TYPE_HEX_COLORS, TYPE_LABELS } from "@/lib/types/institutions";

interface TreeNode {
  id: string;
  name: string;
  abbreviation?: string;
  type: string;
  sector?: string;
  website?: string;
  official?: Official;
  children?: TreeNode[];
}

const SHAPE_SIZE = 6;

function buildTree(institutions: Institution[], officials: Official[]): TreeNode {
  const officialMap = new Map<string, Official>();
  for (const o of officials) {
    officialMap.set(o.institutionId, o);
  }

  const nodeMap = new Map<string, TreeNode>();
  for (const inst of institutions) {
    nodeMap.set(inst.id, {
      id: inst.id,
      name: inst.name,
      abbreviation: inst.abbreviation,
      type: inst.type,
      sector: inst.sector,
      website: inst.website,
      official: officialMap.get(inst.id),
      children: [],
    });
  }

  const root: TreeNode = {
    id: "root",
    name: "Estado de Costa Rica",
    type: "root",
    children: [],
  };

  for (const inst of institutions) {
    const node = nodeMap.get(inst.id)!;
    if (inst.parentId && nodeMap.has(inst.parentId)) {
      nodeMap.get(inst.parentId)!.children!.push(node);
    } else if (!inst.parentId) {
      root.children!.push(node);
    }
  }

  return root;
}

export function RadialGovernmentGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 900 });
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const size = Math.min(width, 900);
        setDimensions({ width: size, height: size });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const treeData = buildTree(
      institutionsData.institutions as Institution[],
      officialsData.officials as Official[]
    );

    const root = d3.hierarchy<TreeNode>(treeData);
    const treeLayout = d3
      .tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    treeLayout(root);

    const g = svg
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .append("g");

    // Draw links
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1)
      .selectAll("path")
      .data(root.links().filter((d) => d.source.depth > 0))
      .join("path")
      .attr(
        "d",
        d3
          .linkRadial<d3.HierarchyLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
          .angle((d) => d.x!)
          .radius((d) => d.y!) as unknown as (d: d3.HierarchyLink<TreeNode>) => string
      );

    // Draw nodes
    const nodes = g
      .append("g")
      .selectAll("g")
      .data(root.descendants().filter((d) => d.depth > 0))
      .join("g")
      .attr(
        "transform",
        (d) => `rotate(${(d.x! * 180) / Math.PI - 90}) translate(${d.y!},0)`
      );

    // Draw shapes based on type
    nodes.each(function (d) {
      const el = d3.select(this);
      const color = TYPE_HEX_COLORS[d.data.type] || TYPE_HEX_COLORS.otro;
      const size = d.depth === 1 ? SHAPE_SIZE * 1.8 : SHAPE_SIZE;

      if (d.data.type === "poder" || d.data.type === "ministerio") {
        // Squares for powers and ministries
        el.append("rect")
          .attr("x", -size)
          .attr("y", -size)
          .attr("width", size * 2)
          .attr("height", size * 2)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .attr("rx", 2);
      } else if (d.data.type === "autonoma" || d.data.type === "semi_autonoma") {
        // Circles for autonomous institutions
        el.append("circle")
          .attr("r", size)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
      } else if (d.data.type === "empresa_publica") {
        // Pentagons for public enterprises
        const pentagon = d3.symbol().type(d3.symbolSquare).size(size * size * 3);
        el.append("path")
          .attr("d", pentagon)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
      } else {
        // Diamonds for others
        const diamond = d3.symbol().type(d3.symbolDiamond).size(size * size * 3);
        el.append("path")
          .attr("d", diamond)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);
      }
    });

    // Labels
    nodes
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x! < Math.PI ? 12 : -12))
      .attr("text-anchor", (d) => (d.x! < Math.PI ? "start" : "end"))
      .attr("transform", (d) =>
        d.x! >= Math.PI ? "rotate(180)" : null
      )
      .attr("fill", "currentColor")
      .attr("font-size", (d) => (d.depth === 1 ? "11px" : "9px"))
      .attr("font-weight", (d) => (d.depth === 1 ? "600" : "400"))
      .text((d) => d.data.abbreviation || d.data.name);

    // Tooltip interactions
    const tooltip = d3.select(tooltipRef.current);

    nodes
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // Highlight the node
        d3.select(this).select("circle, rect, path").attr("stroke-width", 3);

        const official = d.data.official;
        tooltip
          .style("opacity", "1")
          .style("pointer-events", "auto")
          .html(
            `<div class="font-semibold">${d.data.name}</div>
             ${d.data.abbreviation ? `<div class="text-xs text-gray-500">${d.data.abbreviation}</div>` : ""}
             <div class="text-xs mt-1" style="color: ${TYPE_HEX_COLORS[d.data.type] || TYPE_HEX_COLORS.otro}">${TYPE_LABELS[d.data.type] || d.data.type}</div>
             ${d.data.sector ? `<div class="text-xs text-gray-500">Sector: ${d.data.sector}</div>` : ""}
             ${official ? `<div class="text-xs mt-1 font-medium">${official.title}: ${official.name}</div>` : ""}
             <div class="text-xs mt-1 text-blue-600">Haz clic para ver detalles →</div>`
          );
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        tooltip
          .style("left", `${mx + 15}px`)
          .style("top", `${my - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).select("circle, rect, path").attr("stroke-width", 1.5);
        tooltip.style("opacity", "0").style("pointer-events", "none");
      })
      .on("click", function (_event, d) {
        if (d.data.id !== "root") {
          routerRef.current.push(`/gobierno/${d.data.id}`);
        }
      });

    // Center label
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("fill", "currentColor")
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .text("Estado de");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("fill", "currentColor")
      .attr("font-size", "14px")
      .attr("font-weight", "700")
      .text("Costa Rica");
  }, [dimensions]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ maxHeight: "900px" }}
      />
      <div
        ref={tooltipRef}
        className="absolute bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none opacity-0 transition-opacity z-10 max-w-xs"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
