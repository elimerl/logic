import type { LogicSimulation } from '../logic';
import type { LogicGate } from '../logic/gate';

export function renderSim(
  sim: LogicSimulation,
  opts: RenderOptions = {
    fillGates: false,
    fillInputsAndOutputs: true,
    showLabels: false,
  },
) {
  let graph = 'digraph G {';
  sim.gates.forEach((gate) => {
    graph += `"${gate.id}" [label="${
      opts.showLabels ? gate.type : ''
    }", fillcolor=${
      gate.execute() &&
      (gate.type === 'switch' || gate.type === 'light'
        ? opts.fillInputsAndOutputs
        : opts.fillGates)
        ? gate.type === 'switch' || gate.type === 'light'
          ? 'green'
          : 'lightblue'
        : 'white'
    }, style=filled, href="javascript:window.handleClick('${gate.id}')"]\n`;
    gate.connections.input.forEach((input) => {
      graph += `"${input}" -> "${gate.id}" [color=${
        (sim.getGate(input) as LogicGate).execute() ? 'green' : 'black'
      },href="javascript:window.deleteConnection('${input}','${
        gate.id
      }')", penwidth=2]\n`;
    });
  });
  graph += '}';
  return graph;
}
export interface RenderOptions {
  fillGates: boolean;
  fillInputsAndOutputs: boolean;
  showLabels: boolean;
}
