# Traffic replay defect report

## Scope and evidence

The replay path is:

`SUMO FCD export -> *_traffic.json manifest -> TrafficReplay.frame() -> decoded vehicle rows -> makeTransition()/sampleTransition() -> app.js requestAnimationFrame playback -> Traffic3D.update() / GeoJSON vehicle source`.

The supplied MP4 was not available to the repository runtime, so no claim is made about having inspected that recording. The findings below use the checked-in SUMO replay chunks and the browser implementation.

## Findings

| Bug | Reproduction | Root cause | Fix | Verification | Limitations |
| --- | --- | --- | --- | --- | --- |
| Curved and junction movement could use a stale transition after a seek or alternate frame pair | Seek rapidly, then request interpolation for the same source second with a different target frame | `TrafficReplay.between()` keyed transitions only by `from.time` | Key transitions by both source and target timestamps | `road-motion.test.mjs`; stale-cache test | Browser timing still depends on network availability |
| Gap intervals froze or teleported a vehicle | Interpolate Maârif vehicle 377 from lane 14458 at time 505 to lane 18748 at time 506 | `sampleTransition()` returned the source position for every intermediate fraction of a `gap` | Use an explicit source-faithful policy: show only the source at fraction 0, show only the target at fraction 1, and hide unresolved intermediate positions; exits use only fraction 0 and entries only fraction 1 | Unit and Chromium replay of the actual 505→506 records | External basemap tiles were blocked in the browser environment |
| Concurrent stale frame requests could duplicate work and leave cache state dependent on response order | Request frames 0–7, then pin and request frames 8–9 with delayed responses | Frame loads had no pending-request deduplication and chunk eviction could retain in-flight entries | Deduplicate pending frame loads and evict only settled chunks; remove speculative prefetch that raced cache bounds | `replay-cache.test.mjs` | Source data may still contain legitimate discontinuities |
| Disconnected lane changes were visually ambiguous | Inspect transitions classified as `gap` in the checked-in manifests | Some consecutive SUMO records have no connected lane path or exceed the measured one-second travel budget | Preserve the source position and mark an explicit `gap` transition; never invent a route | Full-manifest scan found 54, 10, 5, 25 and 16 gaps for Maârif, Hay Hassani, Ben M’Sick, Sidi Maârouf and Bd Mohammed V respectively | These are source-data discontinuities, not all rendering defects |
| Heading interpolation could take the long turn across north | Interpolate angles near 0°/360° | Inline angle arithmetic was duplicated and not directly regression-tested | Centralize shortest-angle interpolation and test both wrap directions | `road-motion.test.mjs` | SUMO heading remains authoritative at valid endpoints |

## Diagnostic mode

Append `?trafficVehicle=<vehicle-id>` to the page URL. The selected replay exposes `window.__TRAFFIC_REPLAY__` and `getDiagnostic()` with source/target times, lanes, positions, interpolation fraction, classification, calculated transform and speed. Gap notices are logged once per vehicle/time transition rather than once per animation frame.

## Validation

Focused checks:

```text
node --test road-motion.test.mjs replay-cache.test.mjs
node --check road-motion.js
node --check app.js
node --check traffic-3d.js
```

Repository checks:

```text
npm test
npm run validate
```

Both completed successfully on the fix branch. Local Chromium smoke recordings were captured outside the repository runtime.

The browser smoke check loaded `index.html` and `maarif` replay data from a local HTTP server. Chromium blocked external map tiles and the OpenFreeMap style, so the raster/map basemap could not be visually compared end to end. Direct Chromium execution of `TrafficReplay.between()` confirmed Maârif vehicle 377 was visible at fractions 0 and 1 for the actual 505→506 observations and absent at fraction 0.5. This demonstrates that the freezing/teleporting gap interval is removed, but it does not claim that all roundabout motion has been visually verified.

## Chromium roundabout recording

A local Chromium pass loaded the portfolio, opened the interactive Casablanca mobility map, and moved the Maârif timeline to frames 505 and 506. The roundabout geometry and nearby vehicle markers were visible, and frame 506 showed the vehicles at their next exported positions.

Demonstrably fixed:
- The 505→506 Maârif lane 14458→18748 gap no longer exposes an invented intermediate position.
- The replay hides unresolved gap intervals instead of freezing or teleporting.
- Frame 505 and frame 506 remain source-faithful boundary observations.
- Vehicle exits hide after the source frame, and vehicle entries appear only at the target frame.

Still present or not independently demonstrated:
- External basemap and tile styles were blocked, so map-tile and roundabout-road visual fidelity could not be verified from the network-loaded basemap.
- The browser pass could not compare every roundabout lane or every frame pair; the source-discontinuity fix is unit-tested and demonstrated at the real 505→506 records, but broader roundabout motion remains a source-data-limited replay.
- SUMO-export continuity gaps that require hidden intervals cannot be reconstructed as real motion by the client.
