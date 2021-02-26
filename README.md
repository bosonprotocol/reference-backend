# Reference Backend

[![Gitter chat](https://badges.gitter.im/bosonprotocol.png)](https://gitter.im/bosonprotocol/community)

This repository is the backend for the MVP version of the Redeemeum service. Questions and comments encouraged.

**Table of Contents:**

- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Usage

1. Create a `.env` file based on the `.env.example` file.

```
DB_CONNECTION_STRING=mongodb://localhost:27017/api # The connection string to MongoDB.
TOKEN_SECRET=1fdd5... # A random string used in the JWT token generation.
GCLOUD_SECRET=1f123ce5... # Your GCloud secret token. See [the Google docs](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets).
VOUCHERS_BUCKET="vouchers-upload-images-bucket" # The name for your bucket in Google cloud storage where the images will be stored.

2. Run:

```sh
npm install
npm start
```

## Contributing

We welcome contributions! Until now, Boson Protocol has been largely worked on by a small dedicated team. However, the ultimate goal is for all of the Boson Protocol repositories to be fully owned by the community and contributors. Issues, pull requests, suggestions, and any sort of involvement are more than welcome.

If you have noticed a bug, [file an issue](/issues). If you have a large pull request, we recommend filing an issue first; small PRs are always welcome.

Questions are also welcome, as long as they are tech related. We can use them to improve our documentation.

By being in this community, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Take a look at it, if you haven't already.

## License

Licensed under [LGPL v3](LICENSE).
