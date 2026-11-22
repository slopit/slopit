# Changelog

## 0.2.0

### Added

- Support for versioned response-control telemetry in the Python session schema.
  Analysts can read event timing, control type, and browser-reported provenance.

### Fixed

- Load complete and interrupted JATOS JSONL sessions. Preserve records in arrival
  order, retain one completed trial per sequence number, and report sequence
  gaps and whether the session reached its terminal record.
