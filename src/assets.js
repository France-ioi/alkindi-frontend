
const options = {
  template: '{}'
};

export const asset_url = function (path) {
  return options.template.replace('{}', path);
};

export const configure = function (newOptions) {
  Object.assign(options, newOptions);
};
