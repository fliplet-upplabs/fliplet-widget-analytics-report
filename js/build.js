// Include your namespaced libraries
var AppAnalytics = new Fliplet.Registry.get('comflipletapp-analytics:1.0:core');

// This function will run for each instance found in the page
Fliplet.Widget.instance('comflipletapp-analytics-1-0-0', function (data) {
  // The HTML element for each instance. You can use $(element) to use jQuery functions on it
  var element = this;

  // Sample implementation to initialise the widget
  var appAnalytics = new AppAnalytics(element, data);
  appAnalytics.start();
});