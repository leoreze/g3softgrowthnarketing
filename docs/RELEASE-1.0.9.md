# G3Soft Growth OS v1.0.9

## Critical frontend render regression fix

The v1.0.8 `app.js` referenced `renderWorkflows` and several shared functions from the global render dispatcher, but those function definitions were missing. Because JavaScript evaluates the renderer map before dispatching the selected view, this caused the entire application render to fail.

v1.0.9 restores the missing functions from the last stable implementation while preserving the v1.0.8 changes.

## Database
No migration.

## Validation
- `npm test`
- `npm run check`
- `npm run build`
