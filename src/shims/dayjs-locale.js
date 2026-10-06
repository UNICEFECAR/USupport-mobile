// Jitsi statically imports every Day.js locale. Metro/Expo 54 does not
// watch those files under node_modules, which breaks SHA-1 hashing.
// Locales still fall back to English in the Jitsi UI.
module.exports = {};
