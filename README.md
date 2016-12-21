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

The `build` script builds the production bundle `build/bundle.js`
containing the transpiled source files and all dependencies:

    $ npm run build

A lightweight server script is used to generate the HTML index:

    $ NODE_ENV=production LISTEN=8001 npm start

The LISTEN environment variable can be a TCP port or a UNIX socket path.

## Development

The `build-dev` script generates a bundle (build/dev-bundle.js) to
reduce page load time during development:

    $ npm run build-dev

Remember to rebuild this bundle whenever dependencies are updated, or
you could run into issues with multiple version of packages being loaded
simultaneously.  Things can get particularly confusing when this happens
with React.

## jspm hell

### transpiling

The build-dev script adds the transpiling packages (`plugin-babel` and
`babel-plugin-transform-react-jsx`) to the bundle to make it available
for transpiling source files.

Using `babel-cli --watch` would be a little faster, but using plugin-babel
allows jspm to be used to include css files from jspm/npm packages.
It is also required for native jspm packages including ES6 code that
needs transpiling.

### debug

Package debug@^2.5.1 needs an override in `package.json` to resolve a 404
error on `browser.js`, until the jspm registry is updated:
```
jspm.overrides['npm:debug@2.5.1'].directories.lib: "src"
````

### scss

The build-dev script looks weird because jspm fails to include plugin-sass
in the bundle.  Adding sass.js fails with an out-of-memory error.  Adding
postcss and autoprefixer works and limits the number of requests used to
load the plugin-sass.

To avoid transforming bootstrap-sass every time the page is loaded, it is
included in src/base.scss, which is included in dev-bundle.js.

