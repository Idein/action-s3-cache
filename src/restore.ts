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
            utils.setCacheHitOutput(false);
            return;
        }

        // Validate inputs, this can cause task failure
        if (!utils.isValidEvent()) {
            utils.logWarning(
                `Event Validation Error: The event type ${process.env[Events.Key]} is not supported because it's not tied to a branch or tag ref.`
            );
            return;
        }

        const primaryKey = core.getInput(Inputs.Key, { required: true });
        core.saveState(State.CachePrimaryKey, primaryKey);

        const restoreKeys = utils.getInputAsArray(Inputs.RestoreKeys);

        try {
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

            const cacheKeys = [primaryKey, ...restoreKeys];

            let cacheKey = "";
            for (const key of cacheKeys) {
                const fileName = key + ".tar.gz";
                try {
                    await new Promise((resolve, reject) => {
                        const src = s3
                            .getObject({
                                Bucket: core.getInput(Inputs.AWSS3Bucket, {
                                    required: true
                                }),
                                Key: fileName
                            })
                            .createReadStream();
                        const dest = fs.createWriteStream(fileName);
                        src.on("error", reject);
                        dest.on("error", reject);
                        dest.on("close", resolve);
                        src.pipe(dest);
                    });

                    await tar.extract({
                        file: fileName
                    });
                    fs.unlinkSync(fileName);

                    cacheKey = key;
                    break;
                } catch (e) {
                    console.log(`No cache is found for key: ${key}`);
                }
            }

            if (cacheKey == "") {
                core.info(
                    `Cache not found for input keys: ${cacheKeys.join(", ")}`
                );
                return;
            }

            // Store the matched cache key
            utils.setCacheState(cacheKey);

            const isExactKeyMatch = utils.isExactKeyMatch(primaryKey, cacheKey);
            utils.setCacheHitOutput(isExactKeyMatch);

            core.info(`Cache restored from key: ${cacheKey}`);
        } catch (error) {
            utils.logWarning(error.message);
            utils.setCacheHitOutput(false);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

export default run;
