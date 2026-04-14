"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import institutionsData from "@/data/seed/institutions.json";
import officialsData from "@/data/seed/officials.json";
import type { Institution, Official } from "@/lib/types/institutions";
import { TYPE_HEX_COLORS, TYPE_LABELS } from "@/lib/types/institutions";

const MOBILE_BREAKPOINT = 640;

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

// Clone a TreeNode without its children — used to build a shallow "pick a branch" view.
function cloneShallow(node: TreeNode): TreeNode {
  return { ...node, children: [] };
}

// Find a node by id anywhere in the tree (DFS).
function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

// Build the tree that d3 should actually render for a given focus.
// - focusId === "root": show Estado de Costa Rica + its direct children only
//   (the 4 poderes), no grandchildren — uncluttered "pick a branch" view.
// - focusId === <some id>: show that node as the new root, with its full subtree.
function getFocusedTree(fullRoot: TreeNode, focusId: string): TreeNode {
  if (focusId === "root") {
    return {
      ...fullRoot,
      children: (fullRoot.children ?? []).map(cloneShallow),
    };
  }
  const node = findNode(fullRoot, focusId);
  return node ?? fullRoot;
}

export function RadialGovernmentGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 900 });
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [focusId, setFocusId] = useState<string>("root");
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const isMobile = dimensions.width > 0 && dimensions.width < MOBILE_BREAKPOINT;

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
    const mobile = width > 0 && width < MOBILE_BREAKPOINT;
    const radius = Math.min(width, height) / 2 - (mobile ? 28 : 40);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const fullTree = buildTree(
      institutionsData.institutions as Institution[],
      officialsData.officials as Official[]
    );
    // On mobile, only render the focused slice; on desktop, always the full tree.
    const treeData = mobile ? getFocusedTree(fullTree, focusId) : fullTree;

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
      const base = mobile ? SHAPE_SIZE * 1.4 : SHAPE_SIZE;
      const size =
        d.depth === 1 ? base * (mobile ? 1.9 : 1.8) : base;

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

    // Labels. On mobile at the root-focus view we only have 4 poderes, so all
    // labels fit; inside a drilled-in subtree we still render every label since
    // we're only showing one branch.
    nodes
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x! < Math.PI ? 12 : -12))
      .attr("text-anchor", (d) => (d.x! < Math.PI ? "start" : "end"))
      .attr("transform", (d) =>
        d.x! >= Math.PI ? "rotate(180)" : null
      )
      .attr("fill", "currentColor")
      .attr("font-size", (d) => {
        if (mobile) return d.depth === 1 ? "13px" : "11px";
        return d.depth === 1 ? "11px" : "9px";
      })
      .attr("font-weight", (d) => (d.depth === 1 ? "600" : "400"))
      .text((d) => d.data.abbreviation || d.data.name);

    nodes.style("cursor", "pointer");

    if (mobile) {
      // Pinch/pan zoom so users can push past any remaining density.
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.8, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform.toString());
        });
      svg.call(zoom);

      // Mobile: tap to select (highlight + info card below), no floating tooltip
      nodes.on("click", function (_event, d) {
        nodes
          .select("circle:not([fill='transparent']), rect, path")
          .attr("stroke-width", 1.5);
        d3.select(this)
          .select("circle:not([fill='transparent']), rect, path")
          .attr("stroke-width", 3);
        setSelectedNode(d.data);
      });
    } else {
      // Desktop: hover tooltip + click to navigate
      const tooltip = d3.select(tooltipRef.current);

      nodes
        .on("mouseover", function (event, d) {
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
    }

    // Center label — reflects whatever is currently at the center of the radial.
    // On desktop and at mobile focus="root", that's "Estado de Costa Rica".
    // When drilled into a poder on mobile, it's the poder's name/abbreviation.
    const centerLines =
      mobile && focusId !== "root"
        ? [treeData.abbreviation || treeData.name]
        : ["Estado de", "Costa Rica"];

    centerLines.forEach((line, i) => {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", centerLines.length === 1 ? "0.35em" : i === 0 ? "-0.5em" : "1em")
        .attr("fill", "currentColor")
        .attr("font-size", "14px")
        .attr("font-weight", "700")
        .text(line);
    });
  }, [dimensions, focusId]);

  // Clear the mobile selection and focus whenever we cross the breakpoint
  useEffect(() => {
    setSelectedNode(null);
    setFocusId("root");
  }, [isMobile]);

  // The tree we render on mobile at focus="root" has its grandchildren stripped,
  // so selectedNode.children is unreliable. Check the full tree instead to decide
  // whether to show a drill-in affordance.
  const selectedHasChildren = (() => {
    if (!selectedNode || selectedNode.id === "root") return false;
    const fullTree = buildTree(
      institutionsData.institutions as Institution[],
      officialsData.officials as Official[]
    );
    const full = findNode(fullTree, selectedNode.id);
    return !!full?.children && full.children.length > 0;
  })();

  const selectedColor = selectedNode
    ? TYPE_HEX_COLORS[selectedNode.type] || TYPE_HEX_COLORS.otro
    : undefined;

  return (
    <div ref={containerRef} className="relative w-full">
      {isMobile && focusId === "root" && (
        <p className="text-xs text-muted text-center mb-2 sm:hidden">
          Toca un poder y luego &quot;Explorar&quot; para ver sus instituciones
        </p>
      )}
      {isMobile && focusId !== "root" && (
        <div className="flex items-center justify-between mb-2 sm:hidden">
          <button
            type="button"
            onClick={() => {
              setFocusId("root");
              setSelectedNode(null);
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Volver
          </button>
          <p className="text-xs text-muted">Pellizca para acercar</p>
        </div>
      )}
      <svg
        ref={svgRef}
        className="w-full"
        style={{ maxHeight: "900px" }}
      />
      {!isMobile && (
        <div
          ref={tooltipRef}
          className="absolute bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-sm pointer-events-none opacity-0 transition-opacity z-10 max-w-xs"
          style={{ opacity: 0 }}
        />
      )}
      {isMobile && selectedNode && (
        <div className="mt-4 bg-surface border border-border rounded-xl shadow-sm p-4 relative">
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
            aria-label="Cerrar"
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-muted hover:bg-border/50"
          >
            ×
          </button>
          <div className="font-semibold pr-8">{selectedNode.name}</div>
          {selectedNode.abbreviation && (
            <div className="text-xs text-muted">{selectedNode.abbreviation}</div>
          )}
          <div
            className="text-xs mt-1 font-medium"
            style={{ color: selectedColor }}
          >
            {TYPE_LABELS[selectedNode.type] || selectedNode.type}
          </div>
          {selectedNode.sector && (
            <div className="text-xs text-muted mt-1">
              Sector: {selectedNode.sector}
            </div>
          )}
          {selectedNode.official && (
            <div className="text-xs mt-2 font-medium">
              {selectedNode.official.title}: {selectedNode.official.name}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-3">
            {selectedNode.id !== "root" && (
              <Link
                href={`/gobierno/${selectedNode.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver detalles →
              </Link>
            )}
            {selectedHasChildren && focusId !== selectedNode.id && (
              <button
                type="button"
                onClick={() => {
                  setFocusId(selectedNode.id);
                  setSelectedNode(null);
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Explorar ramas →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
