# cache to S3

Cache dependencies and build outputs to S3.
This action is a mod of [actions/cache](https://github.com/marketplace/actions/cache).

## Prerequisites

- A S3 bucket
- AWS Access and Secret Keys to access the S3 bucket

## Usage

To restore cache if it exists, do

```yml
- name: use cache
  id: cache-foo
  uses: idein/action-s3-cache
  with:
    key: cache-key-bar
    path: baz/
    aws-s3-bucket: your-s3-bucket
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-west-1
```

Saving cache is automatically executed as a job postprocess.
