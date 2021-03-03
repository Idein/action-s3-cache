export enum Inputs {
    Key = "key",
    Path = "path",
    RestoreKeys = "restore-keys",
    AWSS3Bucket = "aws-s3-bucket",
    AWSAccessKeyId = "aws-access-key-id",
    AWSSecretAccessKey = "aws-secret-access-key",
    AWSRegion = "aws-region"
}

export enum Outputs {
    CacheHit = "cache-hit"
}

export enum State {
    CachePrimaryKey = "CACHE_KEY",
    CacheMatchedKey = "CACHE_RESULT"
}

export enum Events {
    Key = "GITHUB_EVENT_NAME",
    Push = "push",
    PullRequest = "pull_request"
}

export const RefKey = "GITHUB_REF";
