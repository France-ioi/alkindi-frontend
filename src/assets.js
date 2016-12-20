
const options = {
  template: '/assets/{}'
};

export const asset_url = function (path) {
  return `/assets/${path}`;
};

export const configure = function (newOptions) {
  Object.assign(options, newOptions);
};
