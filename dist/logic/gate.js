import {nanoid} from "../../_snowpack/pkg/nanoid.js";
export class LogicGate {
  constructor(sim, type, connections = {
    input: []
  }, id = nanoid()) {
    this.sim = sim;
    this.type = type;
    this.connections = connections;
    this.id = id;
    if (type === "switch" && this.constructor.name === "LogicGate" || type === "switch" && this.constructor.name === "LogicGate")
      throw new Error(`Create a Lightbulb or a Switch, not new LogicGate(sim,'${type}')`);
  }
  serialize() {
    return {type: this.type, connections: this.connections, id: this.id};
  }
  execute() {
    switch (this.type) {
      case "and":
        return this.connections.input.every((id) => this.getGateOutput(id));
      case "or":
        return this.connections.input.some((id) => this.getGateOutput(id));
      case "xor":
        return this.connections.input.filter((id) => this.getGateOutput(id)).length === 1;
      case "nor":
        return !this.connections.input.some((id) => this.getGateOutput(id));
      case "nand":
        return !this.connections.input.every((id) => this.getGateOutput(id));
      case "xnor":
        return !(this.connections.input.filter((id) => this.getGateOutput(id)).length === 1);
      case "switch":
      case "light":
        return false;
      default:
        throw new Error("Invalid type " + this.type);
    }
  }
  getGateOutput(id) {
    return this.sim.getGate(id) ? this.sim.getGate(id).execute() : false;
  }
}
export class Lightbulb extends LogicGate {
  constructor(sim, connections = {
    input: []
  }, id = nanoid()) {
    super(sim, "or", connections, id);
    this.sim = sim;
    this.connections = connections;
    this.id = id;
    this.type = "light";
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
  constructor(sim, output, connections = {
    input: []
  }, id = nanoid()) {
    super(sim, "switch", connections, id);
    this.sim = sim;
    this.output = output;
    this.connections = connections;
    this.id = id;
  }
  execute() {
    return this.output;
  }
}
