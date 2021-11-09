"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputAsInt = exports.getInputAsArray = exports.isValidEvent = exports.logWarning = exports.getCacheState = exports.setOutputAndState = exports.setCacheHitOutput = exports.setCacheState = exports.isExactKeyMatch = exports.isGhes = void 0;
const core = __importStar(require("@actions/core"));
const constants_1 = require("../constants");
function isGhes() {
    const ghUrl = new URL(process.env["GITHUB_SERVER_URL"] || "https://github.com");
    return ghUrl.hostname.toUpperCase() !== "GITHUB.COM";
}
exports.isGhes = isGhes;
function isExactKeyMatch(key, cacheKey) {
    return !!(cacheKey &&
        cacheKey.localeCompare(key, undefined, {
            sensitivity: "accent"
        }) === 0);
}
exports.isExactKeyMatch = isExactKeyMatch;
function setCacheState(state) {
    core.saveState(constants_1.State.CacheMatchedKey, state);
}
exports.setCacheState = setCacheState;
function setCacheHitOutput(isCacheHit) {
    core.setOutput(constants_1.Outputs.CacheHit, isCacheHit.toString());
}
exports.setCacheHitOutput = setCacheHitOutput;
function setOutputAndState(key, cacheKey) {
    setCacheHitOutput(isExactKeyMatch(key, cacheKey));
    // Store the matched cache key if it exists
    cacheKey && setCacheState(cacheKey);
}
exports.setOutputAndState = setOutputAndState;
function getCacheState() {
    const cacheKey = core.getState(constants_1.State.CacheMatchedKey);
    if (cacheKey) {
        core.debug(`Cache state/key: ${cacheKey}`);
        return cacheKey;
    }
    return undefined;
}
exports.getCacheState = getCacheState;
function logWarning(message) {
    const warningPrefix = "[warning]";
    core.info(`${warningPrefix}${message}`);
}
exports.logWarning = logWarning;
// Cache token authorized for all events that are tied to a ref
// See GitHub Context https://help.github.com/actions/automating-your-workflow-with-github-actions/contexts-and-expression-syntax-for-github-actions#github-context
function isValidEvent() {
    return constants_1.RefKey in process.env && Boolean(process.env[constants_1.RefKey]);
}
exports.isValidEvent = isValidEvent;
function getInputAsArray(name, options) {
    return core
        .getInput(name, options)
        .split("\n")
        .map(s => s.trim())
        .filter(x => x !== "");
}
exports.getInputAsArray = getInputAsArray;
function getInputAsInt(name, options) {
    const value = parseInt(core.getInput(name, options));
    if (isNaN(value) || value < 0) {
        return undefined;
    }
    return value;
}
exports.getInputAsInt = getInputAsInt;
