import globals from "../../../../node_modules/globals/index.js";
const rules = {
  "no-const-assign": "error",
  "no-undef": "error",
  "no-redeclare": "error",
  "no-dupe-keys": "error",
  "no-use-before-define": ["error", { functions: false, classes: true, variables: false }],
  "no-func-assign": "error",
  "no-import-assign": "error",
  "no-self-assign": "error",
  "no-unreachable": "error",
  "no-dupe-else-if": "error",
  "no-unsafe-finally": "error",
};
const gas = Object.fromEntries("SpreadsheetApp PropertiesService Utilities UrlFetchApp MailApp GmailApp HtmlService CacheService LockService Session ScriptApp ContentService Logger DriveApp".split(" ").map((k) => [k, "readonly"]));
export default [
  { files: ["src/gas-Code.js"], languageOptions: { sourceType: "script", ecmaVersion: 2022, globals: { ...gas, console: "readonly" } }, rules },
  { files: ["src/gas-js.js", "src/admin-index.js"], languageOptions: { sourceType: "script", ecmaVersion: 2022, globals: { ...globals.browser, google: "readonly", tinymce: "readonly" } }, rules },
  { files: ["site/**/*.js"], languageOptions: { sourceType: "script", ecmaVersion: 2022, globals: { ...globals.browser, APP_DATA: "writable", UI: "readonly", turnstile: "readonly" } }, rules },
  { files: ["worker/**/*.js"], languageOptions: { sourceType: "module", ecmaVersion: 2022, globals: { ...globals.serviceworker, ...globals.es2021, AbortSignal: "readonly" } }, rules },
];
