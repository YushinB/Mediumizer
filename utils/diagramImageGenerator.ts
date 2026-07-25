/**
 * Utility to parse Mermaid charts and generate high-quality vector SVG/PNG diagram images
 * that accurately reflect the workflow nodes and process steps.
 */

export interface DiagramNode {
  id: string;
  label: string;
}

/**
 * Extracts clean node labels and step flow from Mermaid chart definition
 */
export const extractMermaidNodes = (chart: string): DiagramNode[] => {
  if (!chart) return [];

  const nodes: DiagramNode[] = [];
  const seenLabels = new Set<string>();

  // Regex to match Mermaid node definitions like A[Label], A(Label), A{Label}, A([Label])
  const nodeRegex = /([A-Za-z0-9_-]+)\s*(?:\[|\[\(|\(|\{\||\{\{|\()\s*["']?([^"'\n\]\}]+)["']?\s*(?:\]|\)|\}|\]\))/g;

  let match;
  while ((match = nodeRegex.exec(chart)) !== null) {
    const id = match[1];
    let label = match[2].trim();

    // Clean up markdown formatting inside node label
    label = label.replace(/[*_~`]/g, '').replace(/<br\s*\/?>/gi, ' ');

    if (label && !seenLabels.has(label.toLowerCase())) {
      seenLabels.add(label.toLowerCase());
      nodes.push({ id, label });
    }
  }

  // Fallback if no structured bracket nodes found: split by arrows or lines
  if (nodes.length === 0) {
    const lines = chart
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('graph') && !l.startsWith('flowchart') && !l.startsWith('subgraph'));

    lines.forEach((line, idx) => {
      const parts = line.split(/-->|---|==>|->/);
      parts.forEach((p) => {
        const clean = p.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
        if (clean && clean.length > 2 && !seenLabels.has(clean.toLowerCase())) {
          seenLabels.add(clean.toLowerCase());
          nodes.push({ id: `node_${idx}`, label: clean });
        }
      });
    });
  }

  return nodes.slice(0, 6); // Max 6 nodes for neat visual layout
};

/**
 * Generates an SVG Data URL representing the Mermaid workflow as a modern technical infographic card
 */
export const generateMermaidSvgDataUrl = (chart: string): string => {
  const nodes = extractMermaidNodes(chart);

  const displayNodes =
    nodes.length > 0
      ? nodes
      : [
          { id: '1', label: 'Input System' },
          { id: '2', label: 'Processing Engine' },
          { id: '3', label: 'Validation Logic' },
          { id: '4', label: 'Output Result' },
        ];

  const width = 1200;
  const height = 630;

  const cardCount = displayNodes.length;
  const cardWidth = Math.min(220, Math.floor((width - 120 - (cardCount - 1) * 30) / cardCount));
  const cardHeight = 160;
  const startX = Math.max(60, Math.floor((width - (cardCount * cardWidth + (cardCount - 1) * 30)) / 2));
  const startY = 250;

  const cardsSvg = displayNodes
    .map((node, index) => {
      const x = startX + index * (cardWidth + 30);
      const y = startY;
      const stepNumber = String(index + 1).padStart(2, '0');

      // Escape XML characters in label
      const safeLabel = node.label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      const arrowSvg =
        index < cardCount - 1
          ? `<g transform="translate(${x + cardWidth + 5}, ${y + cardHeight / 2 - 12})">
               <line x1="0" y1="12" x2="20" y2="12" stroke="#10b981" stroke-width="3" stroke-dasharray="4 2"/>
               <polygon points="18,7 25,12 18,17" fill="#10b981"/>
             </g>`
          : '';

      return `
        <!-- Node Card ${index + 1} -->
        <g>
          <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2" />
          <rect x="${x}" y="${y}" width="${cardWidth}" height="6" rx="3" fill="url(#emerald-gradient)" />
          
          <circle cx="${x + 28}" cy="${y + 36}" r="14" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
          <text x="${x + 28}" y="${y + 41}" fill="#10b981" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">${stepNumber}</text>

          <foreignObject x="${x + 16}" y="${y + 60}" width="${cardWidth - 32}" height="${cardHeight - 70}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 700; line-height: 1.35; word-wrap: break-word; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">
              ${safeLabel}
            </div>
          </foreignObject>
        </g>
        ${arrowSvg}
      `;
    })
    .join('');

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#090d16" />
      </linearGradient>
      <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.3"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg-gradient)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Top Glow Line -->
    <rect x="0" y="0" width="${width}" height="4" fill="url(#emerald-gradient)" />

    <!-- Header Badge -->
    <g transform="translate(60, 65)">
      <rect x="0" y="0" width="220" height="30" rx="15" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
      <text x="110" y="19" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" font-weight="800" letter-spacing="1.5" text-anchor="middle">SYSTEM ARCHITECTURE</text>
    </g>

    <!-- Title -->
    <text x="60" y="135" fill="#ffffff" font-family="system-ui, sans-serif" font-size="32" font-weight="900" letter-spacing="-0.5">
      Workflow &amp; Process Diagram
    </text>
    <text x="60" y="170" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" font-weight="500">
      Visual breakdown of component interactions and data logic flow
    </text>

    <!-- Nodes Flow -->
    ${cardsSvg}

    <!-- Footer Branding -->
    <g transform="translate(60, 565)">
      <circle cx="10" cy="-5" r="5" fill="#10b981" />
      <text x="25" y="-1" fill="#64748b" font-family="system-ui, sans-serif" font-size="12" font-weight="600">MEDIUMIZER ARCHITECTURAL DIAGRAM ENGINE</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};
