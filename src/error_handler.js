
// Install a global error handler.

export default function (config) {

  const logUrl = 'https://alkindi.epixode.fr/reports/';
  window.onerror = function (message, url, line, column, error) {
    // Prevent firing the default handler for errors on log URLs.
    if (url.startsWith(logUrl))
      return true;
    try {
      const img = document.createElement('img');
      const qs = [
        'version=' + encodeURIComponent(config.frontend_version),
        'user_id=' + encodeURIComponent(config.seed.user.id)
      ];
      if (!config.nocdn) {
        // If the scripts bundle is hosted on a CDN, the arguments will be
        // uninteresting.  Reload the page bypassing the CDN.
        // window.location.search = '?nocdn';
        qs.push('url=' + encodeURIComponent(url));
        qs.push('line=' + encodeURIComponent(line));
        qs.push('column=' + encodeURIComponent(column));
        qs.push('message=' + encodeURIComponent(message));
        qs.push('printer=' + encodeURIComponent(printer));
        let strError, printer;
        try { strError = JSON.stringify(error); printer = 'json'; } catch (err) {
        try { strError = error.toString(); printer = 'toString'; } catch (err) {
          strError = err.toString();
          printer = 'null';
        }};
        qs.push('error=' + encodeURIComponent(strError));
      }
      img.src = logUrl + '?' + qs.join('&');
      document.getElementById('reports').appendChild(img);
    } catch (err) {
      console.log('double fault', err);
    }
  };
  // Use this function to manually send an error report.
  window.reportError = function (value) {
    setTimeout(function () { throw value; }, 0);
  };

};
