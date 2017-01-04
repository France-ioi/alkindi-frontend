# Description

This repository contains frontend components (web interface) for the
Alkindi competition, rounds 2+.

# Installation

It is recommended to instal jspm globally (otherwise replace `jspm` by
`./node_modules/.bin/jspm` in subsequent instructions):

    $ npm install -g jspm@beta

The build process uses npm and jspm 0.17:

    $ npm install
    $ jspm install

## Production

The `build` script builds the production bundle `build/bundle.js`
containing the transpiled source files and all dependencies:

    $ npm run build

A lightweight server script is used to generate the HTML index:

    $ NODE_ENV=production \
      START_URL='https://suite.concours-alkindi.fr/start' \
      LISTEN=8001
      npm start

The LISTEN environment variable can be a TCP port or a UNIX socket path.

## Development

Transpiling is done server-side as babel currently produces much better
source maps this way.  During development, run the `watch` script to
automatically transpile source files as they are modified.

    $ npm run watch

If you delete a file in `src/`, be sure to delete its transpiled version
in `lib/`.  If in doubt, delete and rebuild `lib/`.

The `build-dev` script generates a bundle (build/dev-bundle.js) to
reduce page load time during development:

    $ npm run build-dev

Remember to rebuild this bundle whenever dependencies are updated, or
you could run into issues with multiple version of packages being loaded
simultaneously.  Things can get particularly confusing when this happens
with React.

Start the server script for development:

    $ START_URL='https://alkindi.local/start' \
      LISTEN=8001
      npm start

## jspm hell

Server-side transpiling using babel seems (as of 2017-01-01) to be the
only way of producing useable source maps (when using JSX).
This rules out the use of native jspm packages that include ES6 code
that needs transpiling.

As a result plugin-sass and plugin-scss cannot be used, and plugin-css
must be used to load plain css files from jspm dependencies:

    import "font-awesome/css/font-awesome.min.css!";
    import "bootstrap/dist/css/bootstrap.min.css!";
    import "rc-tooltip/assets/bootstrap.css!";

No build step is needed for the project's css, but additional jspm
configuration is needed to make the css (in `src/`) available to the
transpiled javascript (in `lib/`).  This is done by mapping a
pseudo-package named `alkindi-frontend.css` to the `src/` path
in `jspm.config.js`.
The project's css is then imported thus:

    import "alkindi-frontend.css/style.css!";

If a css build step becomes necessary, the use of a gulp script to build
'lib/style.css' is suggested.

