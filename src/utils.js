const nodeWidth = 80;
const nodeGapWidth = nodeWidth * 2;

let id = 0;
const getNodeId = () => `edgetypes-${(id++).toString()}`;

export function getElements() {
  const initialElements = [
    {
      id: "horizontal-1",
      sourcePosition: "top",
      targetPosition: "bottom",
      data: { label: "eagleViewRequestDocument" },
      position: { x: 1000, y: 1000 }
    },
    {
      id: "horizontal-2",
      sourcePosition: "left",
      type: "input",
      data: { label: "RFP OVERVIEW" },
      position: { x: 1300, y: 800 }
    },
    {
      id: "horizontal-3",
      sourcePosition: "left",
      type: "input",
      className: "dark-node",
      data: { label: "BUSINESS OBJECTIVES" },
      position: { x: 1300, y: 1000 }
    },
    {
      id: "horizontal-4",
      sourcePosition: "left",
      type: "input",
      className: "dark-node",
      data: { label: "SCOPE OF WORK" },
      position: { x: 1300, y: 1200 }
    },
    {
      id: "horizontal-5",
      sourcePosition: "right",
      type: "input",
      className: "dark-node",
      data: { label: "GENERAL REQUIREMENTS & COMPLIANCE REQUIREMENTS" },
      position: { x: 700, y: 800 }
    },
    {
      id: "horizontal-6",
      sourcePosition: "right",
      type: "input",
      className: "dark-node",
      data: { label: "PROJECT MANAGEMENT REQUIREMENTS" },
      position: { x: 700, y: 1000 }
    },
    {
      id: "horizontal-7",
      sourcePosition: "right",
      type: "input",
      className: "dark-node",
      data: { label: "PRICING REQUIREMENTS " },
      position: { x: 700, y: 1200 }
    },
    /* NODE DATA STARTS BELOW :: */
    {
      id: "horizontal-e1-2",
      source: "horizontal-1",
      type: "smoothstep",
      target: "horizontal-2"
    },
    {
      id: "horizontal-e1-3",
      source: "horizontal-1",
      type: "smoothstep",
      target: "horizontal-3"
    },
    {
      id: "horizontal-e1-4",
      source: "horizontal-1", //
      type: "smoothstep",
      target: "horizontal-4"
    },
    {
      id: "horizontal-e3-5",
      source: "horizontal-1",
      type: "smoothstep",
      target: "horizontal-5"
    },
    {
      id: "horizontal-e3-6",
      source: "horizontal-1",
      type: "smoothstep",
      target: "horizontal-6"
    },
    {
      id: "horizontal-e5-7",
      source: "horizontal-1",
      type: "smoothstep",
      target: "horizontal-7"
    }
  ];

  return initialElements;
}
