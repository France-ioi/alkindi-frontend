SystemJS.config({
  production: false,
  map: {
    "babel": "npm:babel-core@6.21.0",
    "babel-plugin-transform-react-jsx": "npm:babel-plugin-transform-react-jsx@6.8.0",
    "debug": "npm:debug@2.5.1",
    "module": "npm:jspm-nodelibs-module@0.2.0",
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.17",
    "postcss": "npm:postcss@5.2.6"
  },
  packages: {
    "npm:babel-core@6.21.0": {
      "map": {
        "babel-messages": "npm:babel-messages@6.8.0",
        "babel-code-frame": "npm:babel-code-frame@6.20.0",
        "babel-template": "npm:babel-template@6.16.0",
        "babel-helpers": "npm:babel-helpers@6.16.0",
        "babel-generator": "npm:babel-generator@6.21.0",
        "babel-register": "npm:babel-register@6.18.0",
        "babel-types": "npm:babel-types@6.21.0",
        "convert-source-map": "npm:convert-source-map@1.3.0",
        "json5": "npm:json5@0.5.1",
        "private": "npm:private@0.1.6",
        "slash": "npm:slash@1.0.0",
        "babylon": "npm:babylon@6.14.1",
        "babel-traverse": "npm:babel-traverse@6.21.0",
        "debug": "npm:debug@2.5.1",
        "path-is-absolute": "npm:path-is-absolute@1.0.1",
        "source-map": "npm:source-map@0.5.6",
        "minimatch": "npm:minimatch@3.0.3",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "lodash": "npm:lodash@4.17.2"
      }
    },
    "npm:babel-template@6.16.0": {
      "map": {
        "babel-types": "npm:babel-types@6.21.0",
        "babylon": "npm:babylon@6.14.1",
        "babel-traverse": "npm:babel-traverse@6.21.0",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "lodash": "npm:lodash@4.17.2"
      }
    },
    "npm:babel-helpers@6.16.0": {
      "map": {
        "babel-template": "npm:babel-template@6.16.0",
        "babel-runtime": "npm:babel-runtime@6.20.0"
      }
    },
    "npm:babel-generator@6.21.0": {
      "map": {
        "babel-messages": "npm:babel-messages@6.8.0",
        "babel-types": "npm:babel-types@6.21.0",
        "source-map": "npm:source-map@0.5.6",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "lodash": "npm:lodash@4.17.2",
        "detect-indent": "npm:detect-indent@4.0.0",
        "jsesc": "npm:jsesc@1.3.0"
      }
    },
    "npm:babel-register@6.18.0": {
      "map": {
        "babel-core": "npm:babel-core@6.21.0",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "lodash": "npm:lodash@4.17.2",
        "home-or-tmp": "npm:home-or-tmp@2.0.0",
        "mkdirp": "npm:mkdirp@0.5.1",
        "source-map-support": "npm:source-map-support@0.4.6",
        "core-js": "npm:core-js@2.4.1"
      }
    },
    "npm:babel-messages@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0"
      }
    },
    "npm:babel-types@6.21.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "lodash": "npm:lodash@4.17.2",
        "esutils": "npm:esutils@2.0.2",
        "to-fast-properties": "npm:to-fast-properties@1.0.2"
      }
    },
    "npm:babel-traverse@6.21.0": {
      "map": {
        "babel-code-frame": "npm:babel-code-frame@6.20.0",
        "babel-messages": "npm:babel-messages@6.8.0",
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.21.0",
        "babylon": "npm:babylon@6.14.1",
        "lodash": "npm:lodash@4.17.2",
        "debug": "npm:debug@2.5.1",
        "globals": "npm:globals@9.14.0",
        "invariant": "npm:invariant@2.2.2"
      }
    },
    "npm:babel-code-frame@6.20.0": {
      "map": {
        "esutils": "npm:esutils@2.0.2",
        "chalk": "npm:chalk@1.1.3",
        "js-tokens": "npm:js-tokens@2.0.0"
      }
    },
    "npm:debug@2.5.1": {
      "map": {
        "ms": "npm:ms@0.7.2"
      }
    },
    "npm:source-map-support@0.4.6": {
      "map": {
        "source-map": "npm:source-map@0.5.6"
      }
    },
    "npm:detect-indent@4.0.0": {
      "map": {
        "repeating": "npm:repeating@2.0.1"
      }
    },
    "npm:home-or-tmp@2.0.0": {
      "map": {
        "os-tmpdir": "npm:os-tmpdir@1.0.2",
        "os-homedir": "npm:os-homedir@1.0.2"
      }
    },
    "npm:mkdirp@0.5.1": {
      "map": {
        "minimist": "npm:minimist@0.0.8"
      }
    },
    "npm:repeating@2.0.1": {
      "map": {
        "is-finite": "npm:is-finite@1.0.2"
      }
    },
    "npm:is-finite@1.0.2": {
      "map": {
        "number-is-nan": "npm:number-is-nan@1.0.1"
      }
    },
    "npm:babel-plugin-transform-react-jsx@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-plugin-syntax-jsx": "npm:babel-plugin-syntax-jsx@6.18.0",
        "babel-helper-builder-react-jsx": "npm:babel-helper-builder-react-jsx@6.21.1"
      }
    },
    "npm:babel-helper-builder-react-jsx@6.21.1": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.20.0",
        "babel-types": "npm:babel-types@6.21.0",
        "esutils": "npm:esutils@2.0.2",
        "lodash": "npm:lodash@4.17.2"
      }
    }
  },
  trace: true
});
