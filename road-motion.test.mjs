import assert from "node:assert/strict";
import {
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
assert.equal(sampleTransition(invalid, 0.5).gap, true);

assert.equal(shortestAngleDelta(359, 1), 2);
assert.equal(shortestAngleDelta(1, 359), -2);
assert.equal(sampleTransition(straight, Number.NaN).y, 10);
assert.equal(sampleTransition(straight, 0).speed, 10);
assert.equal(sampleTransition(straight, 1).speed, 10);

console.log("PASS road geometry, connected transitions, discontinuity policy, and heading interpolation");
