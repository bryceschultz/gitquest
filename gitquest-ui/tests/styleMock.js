// Jest cannot parse CSS. App.jsx imports './App.css', so stylesheet imports are
// mapped to this empty stub via moduleNameMapper in jest.config.js.
module.exports = {}
