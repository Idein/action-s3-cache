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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const graceful_fs_1 = __importDefault(require("graceful-fs"));
const tar_1 = __importDefault(require("tar"));
const constants_1 = require("./constants");
const utils = __importStar(require("./utils/actionUtils"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (utils.isGhes()) {
                utils.logWarning("Cache action is not supported on GHES");
                return;
            }
            if (!utils.isValidEvent()) {
                utils.logWarning(`Event Validation Error: The event type ${process.env[constants_1.Events.Key]} is not supported because it's not tied to a branch or tag ref.`);
                return;
            }
            const state = utils.getCacheState();
            // Inputs are re-evaluted before the post action, so we want the original key used for restore
            const primaryKey = core.getState(constants_1.State.CachePrimaryKey);
            if (!primaryKey) {
                utils.logWarning(`Error retrieving key from state.`);
                return;
            }
            if (utils.isExactKeyMatch(primaryKey, state)) {
                core.info(`Cache hit occurred on the primary key ${primaryKey}, not saving cache.`);
                return;
            }
            const cachePaths = utils.getInputAsArray(constants_1.Inputs.Path, {
                required: true
            });
            try {
                const fileName = primaryKey + ".tar.gz";
                core.info(`Creating the tar file.`);
                yield tar_1.default.create({
                    gzip: true,
                    file: fileName,
                    preservePaths: true
                }, cachePaths);
                const s3 = new aws_sdk_1.default.S3({
                    accessKeyId: core.getInput(constants_1.Inputs.AWSAccessKeyId, {
                        required: true
                    }),
                    secretAccessKey: core.getInput(constants_1.Inputs.AWSSecretAccessKey, {
                        required: true
                    }),
                    region: core.getInput(constants_1.Inputs.AWSRegion, {
                        required: true
                    })
                });
                s3.upload({
                    Body: graceful_fs_1.default.createReadStream(fileName),
                    Bucket: core.getInput(constants_1.Inputs.AWSS3Bucket, {
                        required: true
                    }),
                    Key: fileName,
                    StorageClass: core.getInput(constants_1.Inputs.AWSS3StorageClass, {
                        required: true
                    })
                }, (err, data) => {
                    if (err) {
                        core.info(`Error: ${err}`);
                    }
                    else {
                        core.info(`Uploaded: ${data.Location}`);
                    }
                });
            }
            catch (error) {
                utils.logWarning(error.message);
            }
        }
        catch (error) {
            utils.logWarning(error.message);
        }
    });
}
run();
exports.default = run;
