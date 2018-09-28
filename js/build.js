(function () {
  // Include your namespaced libraries
  var AnalyticsReport = new Fliplet.Registry.get('comflipletanalytics-report:1.0:core');
  var analyticsReports = {};

  // This function will run for each instance found in the page
  Fliplet.Widget.instance('comflipletanalytics-report-1-0-0', function (data) {
    // The HTML element for each instance. You can use $(element) to use jQuery functions on it
    var element = this;

    // Sample implementation to initialise the widget
    analyticsReports[data.id] = new AnalyticsReport(element, data);
  });

  Fliplet.Widget.register('AnalyticsReport', function () {
    function getReport(options) {
      if (!Object.keys(analyticsReports).length) {
        throw new Error('No reports found.');
      }

      options = options || {};
      var id = options.id;
      if (Object.keys(analyticsReports).length > 1 && !id) {
        throw new Error('There are multiple reports on the page. An id must be provided.');
      }

      var report;

      if (Object.keys(analyticsReports).length === 1) {
        report = analyticsReports[Object.keys(analyticsReports)[0]];
      } else {
        report = analyticsReports[id];
      }

      if (!report) {
        throw new Error('Report not found. Please use a different id.');
      }

      return report;
    }

    return {
      getReport: getReport
    };
  });  
})();
