"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefKey = exports.Events = exports.State = exports.Outputs = exports.Inputs = void 0;
var Inputs;
(function (Inputs) {
    Inputs["Key"] = "key";
    Inputs["Path"] = "path";
    Inputs["RestoreKeys"] = "restore-keys";
    Inputs["AWSS3Bucket"] = "aws-s3-bucket";
    Inputs["AWSAccessKeyId"] = "aws-access-key-id";
    Inputs["AWSSecretAccessKey"] = "aws-secret-access-key";
    Inputs["AWSRegion"] = "aws-region";
    Inputs["AWSS3StorageClass"] = "aws-s3-storage-class";
})(Inputs = exports.Inputs || (exports.Inputs = {}));
var Outputs;
(function (Outputs) {
    Outputs["CacheHit"] = "cache-hit";
})(Outputs = exports.Outputs || (exports.Outputs = {}));
var State;
(function (State) {
    State["CachePrimaryKey"] = "CACHE_KEY";
    State["CacheMatchedKey"] = "CACHE_RESULT";
})(State = exports.State || (exports.State = {}));
var Events;
(function (Events) {
    Events["Key"] = "GITHUB_EVENT_NAME";
    Events["Push"] = "push";
    Events["PullRequest"] = "pull_request";
})(Events = exports.Events || (exports.Events = {}));
exports.RefKey = "GITHUB_REF";
