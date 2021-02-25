import { LogicSimulation } from '../logic/index';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';
import { RenderOptions, renderSim } from './render';
import { Lightbulb, LogicGate, Switch } from '../logic/gate';
declare global {
  interface Window {
    handleClick: (id: string) => void;
    deleteConnection: (input: string, output: string) => void;
  }
}
let lastRender = '';
let firstGate: LogicGate;
const opts: RenderOptions = {
  fillGates: false,
  fillInputsAndOutputs: true,
  showLabels: true,
};
enum Modes {
  ConnectMode,
  DeleteMode,
  SwitchMode,
}
let mode = Modes.ConnectMode;
let sim = new LogicSimulation();
const switches = [new Switch(sim, true), new Switch(sim, true)];
const and = new LogicGate(sim, 'and', { input: switches.map((v) => v.id) });
(document.getElementById('mode') as HTMLSelectElement).onchange = () => {
  switch ((document.getElementById('mode') as HTMLSelectElement).value) {
    case 'connect':
      mode = Modes.ConnectMode;
      break;
    case 'delete':
      mode = Modes.DeleteMode;
      break;
    case 'switch':
      mode = Modes.SwitchMode;
      break;
    default:
      break;
  }
};
sim.gates.push(...switches);
sim.gates.push(new Lightbulb(sim, { input: [and.id] }));
sim.gates.push(and);
const viz = new Viz({ Module, render });
reRender();

const name = document.getElementById('name') as HTMLInputElement;
if (localStorage.getItem('name'))
  name.value = localStorage.getItem('name') as string;
(document.getElementById('save') as HTMLButtonElement).onclick = () => {
  localStorage.setItem('sim' + name.value, JSON.stringify(sim.serialize()));
};
name.onchange = () => {
  localStorage.setItem('name', name.value);
};
(document.getElementById('load') as HTMLButtonElement).onclick = () => {
  sim = new LogicSimulation(
    JSON.parse(localStorage.getItem('sim' + name.value) as string),
  );
  console.log(sim);
  reRender();
};
(document.getElementById('fillGates') as HTMLInputElement).onchange = () => {
  opts.fillGates = (document.getElementById(
    'fillGates',
  ) as HTMLInputElement).checked;
  reRender();
};
(document.getElementById('new-gate') as HTMLButtonElement).onclick = () => {
  console.log(
    'creating new gate with type ' +
      (document.getElementById('gatetype') as HTMLSelectElement).value,
  );
  sim.gates.push(
    (document.getElementById('gatetype') as HTMLSelectElement).value ===
      'switch'
      ? new Switch(sim, false)
      : (document.getElementById('gatetype') as HTMLSelectElement).value ===
        'light'
      ? new Lightbulb(sim)
      : new LogicGate(
          sim,
          //@ts-expect-error
          (document.getElementById('gatetype') as HTMLSelectElement).value,
        ),
  );
  reRender();
};
export {};
function reRender() {
  viz.renderString(renderSim(sim, opts)).then((result) => {
    if (lastRender !== result)
      (document.getElementById('graph') as HTMLDivElement).innerHTML = result;
    lastRender = result;
  });
}
window.handleClick = handleClick;
window.deleteConnection = deleteConnection;

function handleClick(id: string) {
  switch (mode) {
    case Modes.ConnectMode:
      if (firstGate && firstGate.id !== id) {
        console.log(
          'connecting ' + firstGate.type + ' to ' + sim.getGate(id)?.type,
        );
        sim.getGate(id)?.connections.input.push(firstGate.id);
        //@ts-expect-error
        firstGate = undefined;
        reRender();
      } else {
        //@ts-expect-error
        firstGate = sim.getGate(id);
        setTimeout(() => {
          //@ts-expect-error
          firstGate = undefined;
        }, 5000);
      }
      break;
    case Modes.SwitchMode:
      if (sim.getGate(id)?.type === 'switch') {
        (sim.getGate(id) as Switch).output = !(sim.getGate(id) as Switch)
          .output;
        reRender();
      }
      break;
    case Modes.DeleteMode:
      sim.gates.splice(
        sim.gates.findIndex((g) => g.id === id),
        1,
      );
      sim.gates
        .filter((g) => g.connections.input.includes(id))
        .forEach((g) => {
          g.connections.input.splice(g.connections.input.indexOf(id), 1);
        });
      reRender();
  }
}
document.onkeydown = (ev) => {
  switch (ev.keyCode) {
    case 68:
      mode = Modes.DeleteMode;
      (document.getElementById('mode') as HTMLSelectElement).value = 'delete';
      break;
    case 81:
      mode = Modes.ConnectMode;
      (document.getElementById('mode') as HTMLSelectElement).value = 'connect';

      break;
    case 83:
      mode = Modes.SwitchMode;
      (document.getElementById('mode') as HTMLSelectElement).value = 'switch';

      break;
    default:
      break;
  }
};
function deleteConnection(input: string, output: string) {
  console.log(
    [...document.querySelectorAll('.node title')].find(
      (elem) => elem.innerHTML === input,
    )?.parentElement,
  );
  sim
    .getGate(output)
    ?.connections.input.splice(
      sim.getGate(output)?.connections.input.indexOf(input) as number,
      1,
    );

  reRender();
}
