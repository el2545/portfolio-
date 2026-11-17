# Data Review

This review documents the public datasets and source classes used by the portfolio.

## Traffic replay

The website uses generated SUMO-based JSON exports for `bd_mohammed_v`, `ben_msick`, `hay_hassani`, `maarif`, `sidi_maarouf`, and `sidi_mohammed_benabdallah`. The public files include:

- heatmaps for road and vehicle density;
- road-network exports;
- simulation snapshots; and
- chunked replay frames referenced by the traffic manifests.

The source inventory records the local origin and conversion method for these exports. The public replay is reduced to browser-sized data and must not be treated as a live traffic service or as a statistically complete city-wide study.

## Advertising workshop

`advertising-sites.json`, `active-scenes.json`, `panel-crossings.json`, and the corresponding workshop modules describe a demonstration planning model. Their outputs are illustrative estimates; they are not independently verified market-audience measurements or a representation of any network operator's guaranteed delivery.

## Academic and professional documents

Public PDFs include the English, French, Arabic, and Hebrew academic CV variants and a smart-city MCDM paper. Preview PNGs are renderings of the corresponding public CV PDFs.

## Excluded from publication

Private transcripts, national/student identifiers, and private source reports or spreadsheets are excluded. This is enforced by `portfolio-integrity.test.mjs`, and public integrity is checked by `preserved-assets.sha256.json`.

## Review date

Reviewed on 2026-11-17.
