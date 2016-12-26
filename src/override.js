


/*
   When window.location.search changes, update state override and dispatch a
   refresh action.

const locationSearchAsObject = function () {
  return window.location.search.substring(1).split("&").reduce(function(result, value) {
    const parts = value.split('=');
    if (parts[0] !== "") {
      result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }
    return result;
  }, {})
};

*/