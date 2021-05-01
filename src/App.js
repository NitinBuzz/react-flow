import "./styles.css";
import React, { useState, useEffect } from "react";
import ReactFlow, {
  removeElements,
  addEdge,
} from "react-flow-renderer";

import { GraphData } from "./graphData";

const onLoad = (reactFlowInstance) => {
  reactFlowInstance.fitView();
};

export default function App() {
  const [elements, setElements] = useState([]);
  useEffect(() => {
    
    fetch(
      "https://6svl7nm9d4.execute-api.us-east-1.amazonaws.com/dev/eagleViewRequest/123"
    )
      .then((res) => res.json())
      .then((data) => {
        const graphMap = GraphData.restructureJsonSchema(JSON.stringify(data));
        let initialElements = graphMap["nodeMetrics"]["flow-chart"];
        setElements(initialElements);
      })
      .catch(e => console.log(e))
  }, []);
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params) => setElements((els) => addEdge(params, els));
  return (
    <ReactFlow
      elements={elements}
      onLoad={onLoad}
      onElementsRemove={onElementsRemove}
      onConnect={onConnect}
      minZoom={0.2}
    >
      {/* <MiniMap />
      <Controls />
      <Background /> */}
    </ReactFlow>
  );
}
