# Description

This repository contains frontend components (web interface) for the
Alkindi competition, rounds 2+.

# Installation

    $ npm install
    $ jspm install

## Production

The `build` script builds the production bundle `build/bundle.js`
containing the transpiled source files and all dependencies:

    $ npm run build

A lightweight server script is used to generate the HTML index:

    $ NODE_ENV=production \
      START_URL='https://suite.concours-alkindi.fr/start' \
      LISTEN=8001 \
      npm start

The LISTEN environment variable can be a TCP port or a UNIX socket path.

## Development

    $ NODE_ENV=development \
      START_URL='/start' \
      LISTEN=8001 \
      npm start
