(function () {
  // Include your namespaced libraries
  var AnalyticsReport = new Fliplet.Registry.get('comflipletanalytics-report:1.0:core');
  var analyticsReports = [];

  // This function will run for each instance found in the page
  Fliplet.Widget.instance('comflipletanalytics-report-1-0-0', function (data) {
    // The HTML element for each instance. You can use $(element) to use jQuery functions on it
    var element = this;

    // Sample implementation to initialise the widget
    analyticsReports.push({
      id: data.id,
      uuid: data.uuid,
      instance: new AnalyticsReport(element, data)
    });
  });

  Fliplet.Widget.register('AnalyticsReport', function () {
    function getReport(options) {
      if (!Object.keys(analyticsReports).length) {
        throw new Error('No reports found.');
      }

      var report;
      options = options || {};

      if (Object.keys(analyticsReports).length === 1 && false) {
        report = analyticsReports[Object.keys(analyticsReports)[0]];
      } else if (options.id) {
        report = _.find(analyticsReports, { id: parseInt(options.id, 10) });
      } else if (options.uuid) {
        report = _.find(analyticsReports, { uuid: parseInt(options.uuid, 10) });
      } else if (typeof options.index !== 'undefined') {
        report = analyticsReports[parseInt(options.index), 10];
      } else {
        throw new Error('There are multiple reports on the page. An id/uuid/index must be provided.');
      }

      if (!report) {
        throw new Error('Report not found.');
      }

      return report.instance;
    }

    return {
      getReport: getReport
    };
  });  
})();
