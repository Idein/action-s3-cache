import * as core from "@actions/core";
import AWS from "aws-sdk";
import fs from "graceful-fs";
import tar from "tar";

import { Events, Inputs, State } from "./constants";
import * as utils from "./utils/actionUtils";

async function run(): Promise<void> {
    try {
        if (utils.isGhes()) {
            utils.logWarning("Cache action is not supported on GHES");
            return;
        }

        if (!utils.isValidEvent()) {
            utils.logWarning(
                `Event Validation Error: The event type ${
                    process.env[Events.Key]
                } is not supported because it's not tied to a branch or tag ref.`
            );
            return;
        }

        const state = utils.getCacheState();

        // Inputs are re-evaluted before the post action, so we want the original key used for restore
        const primaryKey = core.getState(State.CachePrimaryKey);
        if (!primaryKey) {
            utils.logWarning(`Error retrieving key from state.`);
            return;
        }

        if (utils.isExactKeyMatch(primaryKey, state)) {
            core.info(
                `Cache hit occurred on the primary key ${primaryKey}, not saving cache.`
            );
            return;
        }

        const cachePaths = utils.getInputAsArray(Inputs.Path, {
            required: true
        });

        try {
            const fileName = primaryKey + ".tar.gz";
            core.info(`Creating the tar file.`);
            await tar.create(
                {
                    gzip: true,
                    file: fileName,
                    preservePaths: true
                },
                cachePaths
            );
            const s3 = new AWS.S3({
                accessKeyId: core.getInput(Inputs.AWSAccessKeyId, {
                    required: true
                }),
                secretAccessKey: core.getInput(Inputs.AWSSecretAccessKey, {
                    required: true
                }),
                region: core.getInput(Inputs.AWSRegion, {
                    required: true
                })
            });
            s3.upload(
                {
                    Body: fs.createReadStream(fileName),
                    Bucket: core.getInput(Inputs.AWSS3Bucket, {
                        required: true
                    }),
                    Key: fileName,
                    StorageClass: core.getInput(Inputs.AWSS3StorageClass, {
                        required: true
                    })
                },
                (err, data) => {
                    if (err) {
                        core.info(`Error: ${err}`);
                    } else {
                        core.info(`Uploaded: ${data.Location}`);
                    }
                }
            );
        } catch (error) {
            utils.logWarning(error.message);
        }
    } catch (error) {
        utils.logWarning(error.message);
    }
}

run();

export default run;
