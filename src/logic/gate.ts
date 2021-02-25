import { nanoid } from 'nanoid';
import type { LogicSimulation } from '.';

export interface LogicGateSerializable {
  id: string;
  connections: { input: string[] };
  type: 'or' | 'and' | 'xor' | 'nor' | 'nand' | 'xnor' | 'light' | 'switch';
}
export class LogicGate {
  constructor(
    public sim: LogicSimulation,
    public type:
      | 'or'
      | 'and'
      | 'xor'
      | 'nor'
      | 'nand'
      | 'xnor'
      | 'light'
      | 'switch',
    public connections: { input: string[] } = {
      input: [],
    },
    public id = nanoid(),
  ) {
    if (
      (type === 'switch' && this.constructor.name === 'LogicGate') ||
      (type === 'switch' && this.constructor.name === 'LogicGate')
    )
      throw new Error(
        `Create a Lightbulb or a Switch, not new LogicGate(sim,'${type}')`,
      );
  }
  serialize(): LogicGateSerializable {
    return { type: this.type, connections: this.connections, id: this.id };
  }
  execute(): boolean {
    switch (this.type) {
      case 'and':
        return this.connections.input.every((id) => this.getGateOutput(id));
      case 'or':
        return this.connections.input.some((id) => this.getGateOutput(id));
      case 'xor':
        return (
          this.connections.input.filter((id) => this.getGateOutput(id))
            .length === 1
        );
      case 'nor':
        return !this.connections.input.some((id) => this.getGateOutput(id));
      case 'nand':
        return !this.connections.input.every((id) => this.getGateOutput(id));
      case 'xnor':
        return !(
          this.connections.input.filter((id) => this.getGateOutput(id))
            .length === 1
        );
      case 'switch':
      case 'light':
        return false;
      default:
        throw new Error('Invalid type ' + this.type);
    }
  }
  getGateOutput(id: string) {
    return (this.sim.getGate(id) as LogicGate)
      ? (this.sim.getGate(id) as LogicGate).execute()
      : false;
  }
}
export class Lightbulb extends LogicGate {
  constructor(
    public sim: LogicSimulation,
    public connections: { input: string[] } = {
      input: [],
    },
    public id = nanoid(),
  ) {
    super(sim, 'or', connections, id);
    this.type = 'light';
  }
  getOutput() {
    try {
      return this.getGateOutput(this.connections.input[0]);
    } catch (error) {
      return false;
    }
  }
  execute() {
    return this.getOutput();
  }
}
export class Switch extends LogicGate {
  constructor(
    public sim: LogicSimulation,
    public output: boolean,

    public connections: { input: string[] } = {
      input: [],
    },
    public id = nanoid(),
  ) {
    super(sim, 'switch', connections, id);
  }
  execute() {
    return this.output;
  }
}
