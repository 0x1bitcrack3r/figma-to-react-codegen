/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { width: 400, height: 500 });

figma.ui.onmessage = (msg:any) => {
  if (msg.type === "generate-code") {
    const selectedNodes = figma.currentPage.selection;

    if (selectedNodes.length === 0) {
      figma.ui.postMessage({ type: "error", message: "No elements selected!" });
      return;
    }

    const components = selectedNodes.map((node:any) => ({
      name: node.name || "UnnamedComponent",
      width: node.width,
      height: node.height,
      type: node.type,
      fills: extractColor(node),
    }));

    const code = generateReactCode(components);
    figma.ui.postMessage({ type: "code", code });
  }
};

function extractColor(node:any) {
  const fill = node.fills[0]?.color;
  if (!fill) return "transparent";
  const { r, g, b } = fill;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )}, ${node.opacity || 1})`;
}


function generateReactCode(components:any) {
  return components
    .map(
      ({ name, width, height, fills }:any) => `
import styled from 'styled-components';

const Styled${name} = styled.div\`
  width: ${width}px;
  height: ${height}px;
  background-color: ${fills};
\`;

export const ${name} = () => <Styled${name} />;
`
    )
    .join("\n");
}
