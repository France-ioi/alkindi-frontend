SystemJS.config({
  production: false,
  map: {
    "module": "npm:jspm-nodelibs-module@0.2.0",
    "source-map-support": "npm:source-map-support@0.4.8"
  },
  packages: {
    "npm:source-map-support@0.4.8": {
      "map": {
        "source-map": "npm:source-map@0.5.6"
      }
    }
  }
});
