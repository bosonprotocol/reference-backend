[![banner](docs/assets/banner.png)](https://bosonprotocol.io)

<h1 align="center">Boson Protocol Reference Backend</h1>

[![Gitter chat](https://badges.gitter.im/bosonprotocol.png)](https://gitter.im/bosonprotocol/community)

This is a reference app meant to show how to integrate Boson into a NodeJS back-end. This repository contains a MongoDB service as well as keeper functions. Questions and comments encouraged!

**Table of Contents**

- [Local Development](#local-development)
- [Testing](#testing)
- [Code Linting](#code-linting)
- [Contributing](#contributing)
- [License](#license)

## Local Development

### Prerequisites

For local development of the reference-backend, your development machine will need a few
tools installed.

At a minimum, you'll need:
* Node (12.20)
* NPM (> 6)
* Ruby (2.7)
* Bundler (> 2)
* Git
* Docker
* direnv

For instructions on how to get set up with these specific versions:
* See the [OS X guide](docs/setup/osx.md) if you are on a Mac.
* See the [Linux guide](docs/setup/linux.md) if you use a Linux distribution.

### Running the app locally
1. Create a `.env` file based on the `.env.example` file.

```shell script
DB_CONNECTION_STRING=mongodb://localhost:27017/api # The connection string to MongoDB.
TOKEN_SECRET=1fdd5... # A random string used in the JWT token generation.
GCLOUD_SECRET=1f123ce5... # Your GCloud secret token. See [the Google docs](https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets).
VOUCHERS_BUCKET="vouchers-upload-images-bucket" # The name for your bucket in Google cloud storage where the images will be stored.
```

2. Run:
```shell script
npm install
npm start
```

### Running the build
We have a fully automated local build process to check that your changes are
good to be merged. To run the build:

```shell script
./go
````

By default, the build process fetches all dependencies, compiles, lints,
formats and tests the codebase. There are also tasks for each step. This and
subsequent sections provide more details of each of the tasks.

To fetch dependencies:

```shell script
./go app:dependencies:install
```

## Testing
All tests are written using
[Chai's JavaScript testing](https://www.chaijs.com/guide/)
support.

### Unit Tests
To run the unit tests:

```shell script
./go tests:app:unit
```

### Component Tests
To run the component tests:

```shell script
./go tests:app:component
```

### Persistence Tests
To run the persistence tests:

```shell script
./go tests:app:persistence
```

## Code Linting

Both the app itself and the tests are linted and formatted as part of
the build process.

For the tests, we use:
* [eslint](https://eslint.org/) for linting
* [prettier](https://prettier.io/) for formatting

To lint the app:

```shell script
./go app:lint
```

This will check if the linter is satisfied. If instead you want to attempt to
automatically fix any linting issues:

```shell script
./go app:lint_fix
```

To check the formatting of the app:

```shell script
./go app:format
```

To automatically fix formatting issues:

```shell script
./go app:format_fix
```

Similarly, for the tests, to perform the same tasks:

```shell script
./go tests:app:lint
./go tests:app:lint_fix
./go tests:app:format
./go tests:app:format_fix
```

## Contributing

We welcome contributions! Until now, Boson Protocol has been largely worked on by a small dedicated team. However, the ultimate goal is for all of the Boson Protocol repositories to be fully owned by the community and contributors. Issues, pull requests, suggestions, and any sort of involvement are more than welcome.

If you have noticed a bug, [file an issue](/issues). If you have a large pull request, we recommend filing an issue first; small PRs are always welcome.

Questions are also welcome, as long as they are tech related. We can use them to improve our documentation.

All PRs must pass all tests before being merged.

By being in this community, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Take a look at it, if you haven't already.

## License

Licensed under [LGPL v3](LICENSE).