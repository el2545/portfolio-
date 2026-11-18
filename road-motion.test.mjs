import assert from "node:assert/strict";
import fs from "node:fs";
import {
  TrafficReplay,
  connectedPath,
  lanePoint,
  makeTransition,
  sampleTransition,
  shortestAngleDelta,
} from "./road-motion.js";

const lanes = [
  { id: "straight", edge: "a", length: 100, shape: [[0, 0], [0, 100]], next: [1] },
  { id: "curve", edge: "b", length: 100, shape: [[0, 100], [50, 150], [100, 100]], next: [2] },
  { id: "roundabout", edge: "c", length: 100, shape: [[100, 100], [150, 100], [150, 50], [100, 50]], next: [] },
  { id: "other", edge: "z", length: 10, shape: [[500, 500], [510, 500]], next: [] },
  { id: "parallel", edge: "a", length: 100, shape: [[3, 0], [3, 100]], next: [] },
];
const vehicle = (overrides = {}) => ({
  id: "car",
  lane: 0,
  pos: 10,
  x: 0,
  y: 10,
  angle: 0,
  speed: 10,
  ...overrides,
});

assert.deepEqual(lanePoint(lanes[0], 0), [0, 0]);
assert.deepEqual(lanePoint(lanes[0], 100), [0, 100]);
const curvePoint = lanePoint(lanes[1], 50);
assert.ok(curvePoint[0] > 0 && curvePoint[1] > 100);

const straight = makeTransition(vehicle(), vehicle({ pos: 20, x: 0, y: 20 }), lanes);
assert.equal(straight.kind, "lanes");
assert.deepEqual(sampleTransition(straight, 0), { ...vehicle(), steering: 0 });
assert.deepEqual(sampleTransition(straight, 1), { ...vehicle({ pos: 20, x: 0, y: 20 }), steering: 0 });
assert.ok(sampleTransition(straight, 0.5).y > 10);

const connected = makeTransition(
  vehicle({ lane: 0, pos: 95, y: 95 }),
  vehicle({ lane: 1, pos: 5, x: 0, y: 105, angle: 45 }),
  lanes,
);
assert.deepEqual(connectedPath(lanes, 0, 1), [0, 1]);
assert.equal(connected.kind, "lanes");
assert.ok(Number.isFinite(sampleTransition(connected, 0.5).x));

const roundabout = makeTransition(
  vehicle({ lane: 1, pos: 95, x: 0, y: 105 }),
  vehicle({ lane: 2, pos: 5, x: 105, y: 100, angle: 90 }),
  lanes,
);
assert.equal(roundabout.kind, "lanes");

const laneChange = makeTransition(
  vehicle({ lane: 0, pos: 30 }),
  vehicle({ lane: 4, pos: 40, x: 3, y: 40 }),
  lanes,
);
assert.equal(laneChange.kind, "lane-change");

const invalid = makeTransition(
  vehicle({ lane: 0, pos: 90 }),
  vehicle({ lane: 3, pos: 5, x: 505, y: 500 }),
  lanes,
);
assert.equal(invalid.kind, "gap");
assert.equal(sampleTransition(invalid, 0).visible, true);
assert.equal(sampleTransition(invalid, 0.5).visible, false);
assert.equal(sampleTransition(invalid, 0.5).gap, true);
assert.equal(sampleTransition(invalid, 1).visible, true);
assert.equal(sampleTransition(invalid, 1).x, 505);

const disconnectedExit = makeTransition(
  vehicle({ lane: 0, pos: 90, x: 0, y: 90 }),
  vehicle({ lane: 3, pos: 5, x: 505, y: 500 }),
  lanes,
);
assert.equal(disconnectedExit.reason, "disconnected-lanes");

const exitReplay = new TrafficReplay(
  { type: "sumo_lane_replay", version: 1, step: 1, start: 0, end: 1, zone: "test", origin: [0, 0], scale: 1e-8, ids: ["exit"], chunks: [] },
  { zone: "test", lanes: [{ id: "lane", length: 100, shape: [[0, 0], [0, 100]], next: [], edge: "road" }] },
  async () => { throw new Error("not used"); },
);
const exiting = { id: "exit", lane: 0, pos: 10, x: 0, y: 10, angle: 0, speed: 10 };
const from = { time: 0, vehicles: [exiting] };
const to = { time: 1, vehicles: [] };
assert.equal(exitReplay.between(from, to, 0).length, 1);
assert.equal(exitReplay.between(from, to, 0.5).length, 0);
assert.equal(exitReplay.between(from, to, 1).length, 0);

const entry = { id: "entry", lane: 0, pos: 0, x: 0, y: 0, angle: 0, speed: 10 };
assert.equal(exitReplay.between({ time: 0, vehicles: [] }, { time: 1, vehicles: [entry] }, 0).length, 0);
assert.equal(exitReplay.between({ time: 0, vehicles: [] }, { time: 1, vehicles: [entry] }, 0.5).length, 0);

const maarifManifest = JSON.parse(fs.readFileSync("maarif_traffic.json"));
const maarifNetwork = JSON.parse(fs.readFileSync(maarifManifest.network));
let maarifPrevious = new Map();
let actualGap = null;
for (const descriptor of maarifManifest.chunks) {
  const chunk = JSON.parse(fs.readFileSync(descriptor.file));
  for (const frame of chunk.frames) {
    const current = new Map(frame[1].map(row => [row[0], row]));
    for (const [id, row] of maarifPrevious) {
      const next = current.get(id);
      if (!next) continue;
      const fromVehicle = { id, lane: row[1], pos: row[2], x: row[3], y: row[4], angle: row[5], speed: row[6] };
      const toVehicle = { id, lane: next[1], pos: next[2], x: next[3], y: next[4], angle: next[5], speed: next[6] };
      const transition = makeTransition(fromVehicle, toVehicle, maarifNetwork.lanes);
      if (transition.kind === "gap") {
        actualGap = { frame: frame[0], transition };
        break;
      }
    }
    if (actualGap) break;
    maarifPrevious = current;
  }
  if (actualGap) break;
}
assert.ok(actualGap);
assert.equal(sampleTransition(actualGap.transition, 0).visible, true);
assert.equal(sampleTransition(actualGap.transition, 0.5).visible, false);
assert.equal(sampleTransition(actualGap.transition, 1).x, actualGap.transition.to.x);

assert.equal(shortestAngleDelta(359, 1), 2);
assert.equal(shortestAngleDelta(1, 359), -2);
assert.equal(sampleTransition(straight, Number.NaN).y, 10);
assert.equal(sampleTransition(straight, 0).speed, 10);
assert.equal(sampleTransition(straight, 1).speed, 10);

console.log("PASS road geometry, connected transitions, discontinuity policy, and heading interpolation");
