import {LogicGate} from "./gate.js";
export class LogicSimulation {
  constructor(data = {gates: []}) {
    this.gates = data.gates.map((gate) => {
      return new LogicGate(this, gate.type, gate.connections, gate.id);
    });
  }
  getGate(id) {
    return this.gates.find((gate) => gate.id === id);
  }
  getOutputs(gate) {
    return this.gates.filter((g) => {
      return g.connections.input.includes(g.id);
    });
  }
  execute() {
    return this.gates.forEach((gate) => gate.execute());
  }
  serialize() {
    return {gates: this.gates.map((gate) => gate.serialize())};
  }
}
