import { Lightbulb, LogicGate, LogicGateSerializable, Switch } from './gate';

export class LogicSimulation {
  gates: LogicGate[];
  constructor(data: LogicSimulationSerializable = { gates: [] }) {
    this.gates = data.gates.map((gate) => {
      return gate.type === 'switch'
        ? new Switch(this, gate.output as boolean, gate.connections, gate.id)
        : gate.type === 'light'
        ? new Lightbulb(this, gate.connections, gate.id)
        : new LogicGate(this, gate.type, gate.connections, gate.id);
    });
  }
  getGate(id: string) {
    return this.gates.find((gate) => gate.id === id);
  }
  getOutputs(gate: string) {
    return this.gates.filter((g) => {
      return g.connections.input.includes(g.id);
    });
  }
  execute() {
    return this.gates.forEach((gate) => gate.execute());
  }
  serialize(): LogicSimulationSerializable {
    return { gates: this.gates.map((gate) => gate.serialize()) };
  }
}
export interface LogicSimulationSerializable {
  gates: LogicGateSerializable[];
}
