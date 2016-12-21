# Description

This repository contains frontend components (web interface) for the
Alkindi competition, rounds 2+.

# Installation

The build process uses npm and jspm 0.17:

    $ npm install
    $ ./node_modules/.bin/jspm install

You may want to install jspm globally:

    $ npm install -g jspm@beta

## Production

The `build` script transpiles all source files using babel:

    $ npm run build

The `bundle` script builds the production bundle `build/bundle.js`
containing the transpiled source files and all dependencies:

    $ npm run bundle

A lightweight server script is used to generate the HTML index:

    $ NODE_ENV=production LISTEN=8001 npm start

The LISTEN environment variable can be a TCP port or a UNIX socket path.

## Development

A development workflow is provided by the `build-dev` script which
watches all sources files and updates transpiled outputs:

    $ npm run build-dev

A `bundle-dev` script generates a bundle (build/dev-bundle.js) to speed
up loading the dependencies:

    $ npm run bundle-dev

Remember to update (or delete) this bundle whenever dependencies are
updated, or you could run into issues with multiple version of packages
being loaded simultaneously.  Things can get particularly confusing when
this happens with React.
