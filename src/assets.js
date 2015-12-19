
const options = {
  template: '{}'
};

export const image_url = function (path) {
  return options.template.replace('{}', 'images/' + path);
};

export const configure = function (newOptions) {
  Object.assign(options, newOptions);
};
