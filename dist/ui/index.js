import {LogicSimulation} from "../logic/index.js";
import Viz from "../../_snowpack/pkg/vizjs.js";
import {Module, render} from "../../_snowpack/pkg/vizjs/full.render.js";
import {renderSim} from "./render.js";
import {Lightbulb, LogicGate, Switch} from "../logic/gate.js";
let lastRender = "";
let firstGate;
const opts = {
  fillGates: false,
  fillInputsAndOutputs: true,
  showLabels: true
};
var Modes;
(function(Modes2) {
  Modes2[Modes2["ConnectMode"] = 0] = "ConnectMode";
  Modes2[Modes2["DeleteMode"] = 1] = "DeleteMode";
  Modes2[Modes2["SwitchMode"] = 2] = "SwitchMode";
})(Modes || (Modes = {}));
let mode = 0;
let sim = new LogicSimulation();
const switches = [new Switch(sim, true), new Switch(sim, true)];
const and = new LogicGate(sim, "and", {input: switches.map((v) => v.id)});
document.getElementById("mode").onchange = () => {
  switch (document.getElementById("mode").value) {
    case "connect":
      mode = 0;
      break;
    case "delete":
      mode = 1;
      break;
    case "switch":
      mode = 2;
      break;
    default:
      break;
  }
};
sim.gates.push(...switches);
sim.gates.push(new Lightbulb(sim, {input: [and.id]}));
sim.gates.push(and);
const viz = new Viz({Module, render});
reRender();
const name = document.getElementById("name");
if (localStorage.getItem("name"))
  name.value = localStorage.getItem("name");
document.getElementById("save").onclick = () => {
  localStorage.setItem("sim" + name.value, JSON.stringify(sim.serialize()));
};
name.onchange = () => {
  localStorage.setItem("name", name.value);
};
document.getElementById("load").onclick = () => {
  sim = new LogicSimulation(JSON.parse(localStorage.getItem("sim" + name.value)));
  console.log(sim);
  reRender();
};
document.getElementById("fillGates").onchange = () => {
  opts.fillGates = document.getElementById("fillGates").checked;
  reRender();
};
document.getElementById("new-gate").onclick = () => {
  console.log("creating new gate with type " + document.getElementById("gatetype").value);
  sim.gates.push(document.getElementById("gatetype").value === "switch" ? new Switch(sim, false) : document.getElementById("gatetype").value === "light" ? new Lightbulb(sim) : new LogicGate(sim, document.getElementById("gatetype").value));
  reRender();
};
function reRender() {
  viz.renderString(renderSim(sim, opts)).then((result) => {
    if (lastRender !== result)
      document.getElementById("graph").innerHTML = result;
    lastRender = result;
  });
}
window.handleClick = handleClick;
window.deleteConnection = deleteConnection;
function handleClick(id) {
  switch (mode) {
    case 0:
      if (firstGate && firstGate.id !== id) {
        console.log("connecting " + firstGate.type + " to " + sim.getGate(id)?.type);
        sim.getGate(id)?.connections.input.push(firstGate.id);
        firstGate = void 0;
        reRender();
      } else {
        firstGate = sim.getGate(id);
        setTimeout(() => {
          firstGate = void 0;
        }, 5e3);
      }
      break;
    case 2:
      if (sim.getGate(id)?.type === "switch") {
        sim.getGate(id).output = !sim.getGate(id).output;
        reRender();
      }
      break;
    case 1:
      sim.gates.splice(sim.gates.findIndex((g) => g.id === id), 1);
      sim.gates.filter((g) => g.connections.input.includes(id)).forEach((g) => {
        g.connections.input.splice(g.connections.input.indexOf(id), 1);
      });
      reRender();
  }
}
document.onkeydown = (ev) => {
  switch (ev.keyCode) {
    case 68:
      mode = 1;
      document.getElementById("mode").value = "delete";
      break;
    case 81:
      mode = 0;
      document.getElementById("mode").value = "connect";
      break;
    case 83:
      mode = 2;
      document.getElementById("mode").value = "switch";
      break;
    default:
      break;
  }
};
function deleteConnection(input, output) {
  console.log([...document.querySelectorAll(".node title")].find((elem) => elem.innerHTML === input)?.parentElement);
  sim.getGate(output)?.connections.input.splice(sim.getGate(output)?.connections.input.indexOf(input), 1);
  reRender();
}
