# Description

This repository contains frontend components (web interface) for the
Alkindi competition.

# Requirements

The build process uses node, npm, and jspm 0.17:

    $ nvm install v7.2.1
    $ npm install
    $ ./node_modules/.bin/jspm install

You may want to install jspm globally:

    $ npm install -g jspm@beta

# Building for production

A 'build' script runs babel to transpile all source files:

    $ npm run build

A 'bundle' script builds the production bundle including the transpiled
source files and all dependencies:

    $ npm run bundle

Following these steps, index.html should be functional.

# Building for development

A workflow for development is provided by the 'build-dev' script which
watches all sources files and updates transpiled outputs:

    $ npm run build-dev

A 'build-deps' script generates a bundle (assets/deps.js) which speeds
up loading the dependencies:

    $ npm run build-deps

Remember to update (or delete) this dependencies bundle whenever they
are updated, or you could run into issues with multiple version of
packages being loaded simultaneously.  Things can get particularly
confusing when this happens with React.
