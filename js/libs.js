Fliplet.Registry.set('comflipletanalytics-report:1.0:core', function(element, data) {
  // Private variables
  var dateTimeNow = new Date();
  var dateSelectMode;
  var analyticsStartDate;
  var analyticsEndDate;
  var analyticsPrevStartDate;
  var analyticsPrevEndDate;
  var pvDateTimeObject;
  var pvDataArray = {};
  var timelineActiveDevicesDataPrior = [];
  var timelineActiveDevicesData = [];
  var timelineSessionsDataPrior = [];
  var timelineSessionsData = [];
  var timelineScreenViewsDataPrior = [];
  var timelineScreenViewsData = [];
  var timelineInteractionsDataPrior = [];
  var timelineInteractionsData = [];
  var timelineChart = timelineChart || {};

  var actionsPerUserTable;
  var actionsPerScreenTable;

  var compiledAppMetricsTemplate = Handlebars.compile(Fliplet.Widget.Templates['templates.build.app-metrics']());
  var compiledActiveUserTemplate = Handlebars.compile(Fliplet.Widget.Templates['templates.build.active-user']());
  var compiledPopularScreenTemplate = Handlebars.compile(Fliplet.Widget.Templates['templates.build.popular-screen']());

  var configuration = data;
  var $container = $(element);

  var configTableContext = {
    'users-sessions': {
      dataIndex: 0,
      tableRows: [
        {
          key: 'User email',
          value: '_userEmail'
        },
        {
          key: 'Sessions',
          value: 'sessionsCount'
        }
      ],
      tableSelector: '.active-users-full-table-sessions',
      table: undefined,
      tableColumns: [
        { data: 'User email' },
        { data: 'Sessions' }
      ],
      otherTableOne: 'users-screen-views',
      otherTableTwo: 'users-clicks',
      selectorsToHide: '.active-users-full-table-views, .active-users-full-table-clicks',
      selectorsToShow: '.active-users-full-table-sessions'
    },
    'users-screen-views': {
      dataIndex: 1,
      tableRows: [
        {
          key: 'User email',
          value: '_userEmail'
        },
        {
          key: 'Screen views',
          value: 'count'
        }
      ],
      tableSelector: '.active-users-full-table-views',
      table: undefined,
      tableColumns: [
        { data: 'User email' },
        { data: 'Screen views' }
      ],
      otherTableOne: 'users-sessions',
      otherTableTwo: 'users-clicks',
      selectorsToHide: '.active-users-full-table-sessions, .active-users-full-table-clicks',
      selectorsToShow: '.active-users-full-table-views'
    },
    'users-clicks': {
      dataIndex: 2,
      tableRows: [
        {
          key: 'User email',
          value: '_userEmail'
        },
        {
          key: 'Clicks',
          value: 'count'
        }
      ],
      tableSelector: '.active-users-full-table-clicks',
      table: undefined,
      tableColumns: [
        { data: 'User email' },
        { data: 'Clicks' }
      ],
      otherTableOne: 'users-sessions',
      otherTableTwo: 'users-screen-views',
      selectorsToHide: '.active-users-full-table-sessions, .active-users-full-table-views',
      selectorsToShow: '.active-users-full-table-clicks'
    },
    'screens-screen-views': {
      dataIndex: 0,
      tableRows: [
        {
          key: 'Screen name',
          value: '_pageTitle'
        },
        {
          key: 'Screen views',
          value: 'count'
        }
      ],
      tableSelector: '.popular-sessions-full-table-views',
      table: undefined,
      tableColumns: [
        { data: 'Screen name' },
        { data: 'Screen views' }
      ],
      otherTableOne: 'screens-sessions',
      otherTableTwo: 'screens-clicks',
      selectorsToHide: '.popular-sessions-full-table-sessions, .popular-sessions-full-table-clicks',
      selectorsToShow: '.popular-sessions-full-table-views'
    },
    'screens-sessions': {
      dataIndex: 1,
      tableRows: [
        {
          key: 'Screen name',
          value: '_pageTitle'
        },
        {
          key: 'Sessions',
          value: 'sessionsCount'
        }
      ],
      tableSelector: '.popular-sessions-full-table-sessions',
      table: undefined,
      tableColumns: [
        { data: 'Screen name' },
        { data: 'Sessions' }
      ],
      otherTableOne: 'screens-screen-views',
      otherTableTwo: 'screens-clicks',
      selectorsToHide: '.popular-sessions-full-table-views, .popular-sessions-full-table-clicks',
      selectorsToShow: '.popular-sessions-full-table-sessions'
    },
    'screens-clicks': {
      dataIndex: 2,
      tableRows: [
        {
          key: 'Screen name',
          value: '_pageTitle'
        },
        {
          key: 'Clicks',
          value: 'count'
        }
      ],
      tableSelector: '.popular-sessions-full-table-clicks',
      table: undefined,
      tableColumns: [
        { data: 'Screen name' },
        { data: 'Clicks' }
      ],
      otherTableOne: 'screens-sessions',
      otherTableTwo: 'screens-screen-views',
      selectorsToHide: '.popular-sessions-full-table-views, .popular-sessions-full-table-sessions',
      selectorsToShow: '.popular-sessions-full-table-clicks'
    }
  };

  var chartContainer = $container.find('.chart-holder')[0];
  var chartConfiguration = {
    'title': {
      'text': '',
      'style': {
        'fontSize': '18px',
        'fontWeight': 'normal',
        'fontStyle': 'normal'
      }
    },
    'subtitle': {
      'text': '',
      'style': {
        'fontSize': '18px',
        'fontWeight': 'normal',
        'fontStyle': 'normal'
      }
    },
    'exporting': {
      'enabled': false
    },
    'series': [{
      'data': [],
      'name': 'Prior period',
      'marker': {
        'symbol': 'circle'
      },
      'type': 'areaspline',
      'fillColor': Fliplet.Themes.Current.get('appAnalyticsChartColorTwo') || 'rgba(182,189,204,0.2)',
      'color': Fliplet.Themes.Current.get('appAnalyticsChartColorTwoDot') || '#b6bdcc',
      'label': {
        'enabled': false
      }
    }, {
      'data': [],
      'name': 'Current period',
      'marker': {
        'symbol': 'circle'
      },
      'type': 'areaspline',
      'color': Fliplet.Themes.Current.get('appAnalyticsChartColorOneDot') || '#43ccf0',
      'fillColor': Fliplet.Themes.Current.get('appAnalyticsChartColorOne') || 'rgba(67,204,240,0.4)',
      'label': {
        'enabled': false,
        'connectorAllowed': false
      }
    }],
    'plotOptions': {
      'series': {
        'dataLabels': {
          'enabled': false
        }
      }
    },
    'yAxis': [{
      'title': {
        'text': '',
        'style': {
          'fontSize': '18px',
          'fontWeight': 'normal',
          'fontStyle': 'normal'
        }
      },
      'offset': -10,
      'lineColor': Fliplet.Themes.Current.get('appAnalyticsPanelColor') || '#f4f2f7'
    }],
    'credits': {
      'enabled': false,
      'text': '',
      'href': ''
    },
    'lang': {
      'thousandsSep': ' ,'
    },
    'chart': {
      'style': {
        'fontSize': '12px',
        'fontWeight': 'normal',
        'fontStyle': 'normal'
      },
      'backgroundColor': Fliplet.Themes.Current.get('appAnalyticsPanelColor') || '#f4f2f7',
      'spacingLeft': -10,
      'spacingRight': 0,
      'spacingBottom': 0,
      'spacingTop': 5
    },
    'xAxis': [{
      'title': {
        'style': {
          'fontSize': '18px',
          'fontWeight': 'normal',
          'fontStyle': 'normal'
        }
      },
      'type': 'datetime',
      'alignTicks': false,
      'allowDecimals': false,
      'minorTickLength': 0,
      'tickLength': 5,
      'lineColor': Fliplet.Themes.Current.get('appAnalyticsPanelColor') || '#f4f2f7'
    }],
    'tooltip': {
      'borderWidth': 0
    },
    'pane': {
      'background': []
    },
    'responsive': {
      'rules': []
    },
    'legend': {
      'itemStyle': {
        'fontWeight': '500'
      },
    }
  };

  return {
    chartInitialization: function(element, chartConfig) {
      timelineChart[configuration.id] = Highcharts.chart(element, chartConfig);
    },
    attachEventListeners: function() {
      var _this = this;

      /*********************************************************
      Date picker overlay
      **********************************************************/
      $container.find('.datepicker').datepicker({
        format: 'd M yyyy',
        endDate: '0d',
        container: '.date-picker',
        orientation: 'left',
        autoclose: true
      });
      // custom dates start-date validation
      $container.find('.pickerStartDate').datepicker().on('changeDate', function(e) {
        // if start date exists check end date is after start date
        if (typeof $('.pickerEndDate').data('datepicker').dates[0] === 'undefined') {
          $('.custom-start-date-alert').removeClass('active');
        } else if ($('.pickerEndDate').data('datepicker').dates[0] < $('.pickerStartDate').data('datepicker').dates[0]) {
          $('.custom-dates-inputs').css({
            height: 'auto'
          });
          $('.custom-start-date-alert').addClass('active');
        } else {
          $('.custom-start-date-alert, .custom-end-date-alert').removeClass('active');
        }
      });
      // custom dates end-date validation
      $container.find('.pickerEndDate').datepicker().on('changeDate', function(e) {
        // if start date exists check end date is after start date
        if (typeof $container.find('.pickerStartDate').data('datepicker').dates[0] === 'undefined') {
          $container.find('.custom-end-date-alert').removeClass('active');
        } else if ($container.find('.pickerEndDate').data('datepicker').dates[0] < $container.find('.pickerStartDate').data('datepicker').dates[0]) {
          $container.find('.custom-dates-inputs').css({
            height: 'auto'
          });
          $container.find('.custom-end-date-alert').addClass('active');
        } else {
          $container.find('.custom-end-date-alert, .custom-start-date-alert').removeClass('active');
        }

      });

      $container
        .on('click', '.date-picker-option', function(event) {
          var value = $('.date-picker-option:checked').val();
          if (value == 'custom-dates') {
            var targetHeight = $(this).parents('.date-picker').find('.custom-dates-hidden-content').outerHeight();
            $(this).parents('.date-picker').find('.custom-dates-inputs').animate({
              height: targetHeight
            }, 150);
          } else {
            $(this).parents('.date-picker').find('.custom-dates-inputs').animate({
              height: 0
            }, 150);
          };
        })
        .on('click', '.agenda-icon, .timeframe-text', function() {
          $container.find('.date-picker').addClass('active');
          $('body').addClass('freeze');
        })
        .on('click', '.close-button', function() {
          $container.find('.full-screen-overlay').removeClass('active');
          $('body').removeClass('freeze');
        })
        .on('click', '.apply-button', function() {
          var dateValue = $(this).parents('.date-picker').find('input[name="date-selector"]:checked').val()
          switch (dateValue) {
            case 'last-24-hours':
              dateSelectMode = dateValue;
              _this.calculateAnalyticsDatesFor24Hrs();
              _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
              _this.getNewDataToRender('hour', 5);
              _this.closeOverlay();
              break;
            case 'last-7-days':
              dateSelectMode = dateValue;
              _this.calculateAnalyticsDates(7);
              _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
              _this.getNewDataToRender('day', 5);
              _this.closeOverlay();
              break;
            case 'last-30-days':
              dateSelectMode = dateValue;
              _this.calculateAnalyticsDates(30);
              _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
              _this.getNewDataToRender('day', 5);
              _this.closeOverlay();
              break;
            case 'last-90-days':
              dateSelectMode = dateValue;
              _this.calculateAnalyticsDates(90);
              _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
              _this.getNewDataToRender('day', 5);
              _this.closeOverlay();
              break;
            case 'last-6-months':
              dateSelectMode = dateValue;
              _this.calculateAnalyticsDatesByMonth(6);
              _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
              _this.getNewDataToRender('day', 5);
              _this.closeOverlay();
              break;
            case 'last-12-months':
              dateSelectMode = dateValue;
              _this.calculateAnalyticsDatesByMonth(12);
              _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
              _this.getNewDataToRender('day', 5);
              _this.closeOverlay();
              break;
            case 'custom-dates':
              var customStartDate = $(this).parents('.date-picker').find('.pickerStartDate').data('datepicker').dates[0];
              var customEndDate = $(this).parents('.date-picker').find('.pickerEndDate').data('datepicker').dates[0];
              if (typeof customStartDate === 'undefined') {
                $(this).parents('.date-picker').find('.custom-dates-inputs').css({ height: 'auto' });
                $(this).parents('.date-picker').find('.custom-start-date-alert').addClass('active');
              } else if (typeof customEndDate === 'undefined') {
                $(this).parents('.date-picker').find('.custom-dates-inputs').css({ height: 'auto' });
                $(this).parents('.date-picker').find('.custom-end-date-alert').addClass('active');
              } else if (customEndDate < customStartDate) {
                $(this).parents('.date-picker').find('.custom-dates-inputs').css({ height: 'auto' });
                $(this).parents('.date-picker').find('.custom-end-date-alert').addClass('active');
              } else {
                // no validation errors so update the dates
                dateSelectMode = dateValue;
                _this.calculateAnalyticsDatesCustom(customStartDate, customEndDate, true);
                _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
                _this.getNewDataToRender('day', 5);
                _this.closeOverlay();
              }
              break;
          }
        })
        .on('click', '.more-active-users', function() {
          $container.find('.active-users-overlay').addClass('active');
          $('body').addClass('freeze');
          _this.getMoreActiveUsers();
        })
        .on('click', '.actions-by-user', function() {
          $container.find('.actions-per-user-overlay').addClass('active');
          $('body').addClass('freeze');
          _this.getUserActionData();
        })
        .on('click', '.more-popular-sessions', function() {
          $container.find('.popular-sessions-overlay').addClass('active');
          $('body').addClass('freeze');
          _this.getMorePopularScreens();
        })
        .on('click', '.actions-by-screen', function() {
          $container.find('.actions-per-screen-overlay').addClass('active');
          $('body').addClass('freeze');
          _this.getScreenActionData();
        })
        .on('change', '[name="timeline-selector"]', function() {
          var value = $('[name="timeline-selector"]:checked').val();

          switch (value) {
            case 'timeline-active-users':
              // datetime specified in milliseconds
              timelineChart[configuration.id].series[0].setData(timelineActiveDevicesDataPrior);
              timelineChart[configuration.id].series[1].setData(timelineActiveDevicesData);
              break;
            case 'timeline-sessions':
              // datetime specified in milliseconds
              timelineChart[configuration.id].series[0].setData(timelineSessionsDataPrior);
              timelineChart[configuration.id].series[1].setData(timelineSessionsData);
              break;
            case 'timeline-screen-views':
              // datetime specified in milliseconds
              timelineChart[configuration.id].series[0].setData(timelineScreenViewsDataPrior);
              timelineChart[configuration.id].series[1].setData(timelineScreenViewsData);
              break;
            case 'timeline-clicks':
              // datetime specified in milliseconds
              timelineChart[configuration.id].series[0].setData(timelineInteractionsDataPrior);
              timelineChart[configuration.id].series[1].setData(timelineInteractionsData);
              break;
          }
        })
        .on('change', '[name="users-selector"]', function() {
          var value = $('[name="users-selector"]:checked').val();

          switch (value) {
            case 'users-sessions':
              $(this).parents('.analytics-box').find('.analytics-row-wrapper-users').html(compiledActiveUserTemplate(pvDataArray.activeUserData[0]));
              break;
            case 'users-screen-views':
              $(this).parents('.analytics-box').find('.analytics-row-wrapper-users').html(compiledActiveUserTemplate(pvDataArray.activeUserData[1]));
              break;
            case 'users-clicks':
              $(this).parents('.analytics-box').find('.analytics-row-wrapper-users').html(compiledActiveUserTemplate(pvDataArray.activeUserData[2]));
              break;
          }
        })
        .on('change', '[name="screen-selector"]', function() {
          var value = $('[name="screen-selector"]:checked').val();

          switch (value) {
            case 'screens-screen-views':
              $(this).parents('.analytics-box').find('.analytics-row-wrapper-screen').html(compiledPopularScreenTemplate(pvDataArray.popularScreenData[0]));
              break;
            case 'screens-sessions':
              $(this).parents('.analytics-box').find('.analytics-row-wrapper-screen').html(compiledPopularScreenTemplate(pvDataArray.popularScreenData[1]));
              break;
            case 'screens-clicks':
              $(this).parents('.analytics-box').find('.analytics-row-wrapper-screen').html(compiledPopularScreenTemplate(pvDataArray.popularScreenData[2]));
              break;
          }
        });
    },
    closeOverlay: function() {
      // close overlay
      $container.find('.full-screen-overlay').removeClass('active');
      $('body').removeClass('freeze');
    },
    storeDataToPersistantVariable: function() {
      // save dates to a persistant variable
      pvDateTimeObject = {
        dateSelectMode: dateSelectMode || 'last-7-days',
        sd: analyticsStartDate,
        ed: analyticsEndDate,
        psd: analyticsPrevStartDate,
        ped: analyticsPrevEndDate,
      };

      Fliplet.App.Storage.set({
        'analyticsDateTime': pvDateTimeObject,
        'analyticsDataArray': pvDataArray
      });
    },
    getDataFromPersistantVariable: function() {
      var _this = this;

      // get dates and times
      Fliplet.App.Storage.get('analyticsDateTime')
        .then(function(analyticsDateTime) {
          if (analyticsDateTime) {
            pvDateTimeObject = analyticsDateTime;
            dateSelectMode = pvDateTimeObject.dateSelectMode;
            analyticsStartDate = new Date(pvDateTimeObject.sd);
            analyticsEndDate = new Date(pvDateTimeObject.ed);
            analyticsPrevStartDate = new Date(pvDateTimeObject.psd);
            analyticsPrevEndDate = new Date(pvDateTimeObject.ped);

            _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
            $('[name="date-selector"][value="'+ dateSelectMode +'"]').prop('checked', true);
          } else {
            // default to last 7 days if nothing previously selected
            dateSelectMode = 'last-7-days';
            _this.calculateAnalyticsDates(7);
            _this.updateTimeframe(analyticsStartDate, analyticsEndDate);
          };
        });

      Fliplet.App.Storage.get('analyticsDataArray')
        .then(function(analyticsDataArray) {
          if (analyticsDataArray) {
            _this.prepareDataToRender(analyticsDataArray.data, analyticsDataArray.periodInSeconds, analyticsDataArray.context);
          } else {
            Promise.all([
              _this.getMetricsData(analyticsStartDate, analyticsEndDate, analyticsPrevStartDate, 'hour'),
              _this.getTimelineData(analyticsStartDate, analyticsEndDate, analyticsPrevStartDate, 'hour'),
              _this.getActiveUserData(analyticsStartDate, analyticsEndDate, 5),
              _this.getPopularScreenData(analyticsStartDate, analyticsEndDate, 5)
            ]).then(function(data) {
              var periodDurationInSeconds = (analyticsEndDate - analyticsStartDate);
              _this.prepareDataToRender(data, periodDurationInSeconds, 'hour');
            }).catch(function(error) {
              console.error(error)
            });
          }
        });
    },
    calculateAnalyticsDatesFor24Hrs: function() {
      analyticsStartDate = new Date();
      analyticsEndDate = new Date();
      analyticsPrevStartDate = new Date();
      analyticsPrevEndDate = new Date();
      analyticsStartDate = moment(analyticsEndDate).subtract(1, 'days').toDate();
      analyticsPrevStartDate = moment(analyticsStartDate).subtract(1, 'days').toDate();
      analyticsPrevEndDate = moment(analyticsEndDate).subtract(1, 'days').toDate();
    },
    calculateAnalyticsDates: function(daysToGoBack) {
      var _this = this;
      analyticsStartDate = new Date();
      analyticsEndDate = new Date();
      _this.calculateAnalyticsDatesCustom(analyticsStartDate, analyticsEndDate, false, 'days', daysToGoBack);
    },
    calculateAnalyticsDatesByMonth: function(monthsToGoBack) {
      var _this = this;
      analyticsStartDate = new Date();
      analyticsEndDate = new Date();
      _this.calculateAnalyticsDatesCustom(analyticsStartDate, analyticsEndDate, false, 'months', monthsToGoBack);
    },
    calculateAnalyticsDatesCustom: function(customStartDate, customEndDate, isCustom, time, timeToGoBack) {
      var timeDeltaInMillisecs;

      // Set start date
      analyticsStartDate = new Date(customStartDate);
      if (!isCustom) {
        analyticsStartDate = moment(analyticsStartDate).subtract(timeToGoBack, time).toDate();
      }
      analyticsStartDate.setHours(0, 0, 0, 0);

      // Set end date
      analyticsEndDate = new Date(customEndDate);
      if (isCustom) {
        analyticsEndDate.setDate(analyticsEndDate.getDate() + 1);
      }
      analyticsEndDate.setHours(0, 0, 0, 0);
      analyticsEndDate.setMilliseconds(analyticsEndDate.getMilliseconds() - 1);

      // Calculates the difference between end and start dates
      // Only applicable to custom dates
      if (isCustom) {
        timeDeltaInMillisecs = analyticsEndDate - analyticsStartDate;
      }

      // Set previous period start date
      analyticsPrevStartDate = new Date(analyticsStartDate);
      if (isCustom) {
        analyticsPrevStartDate.setMilliseconds(analyticsEndDate.getMilliseconds() - timeDeltaInMillisecs);
      } else {
        analyticsPrevStartDate = moment(analyticsPrevStartDate).subtract(timeToGoBack, time).toDate();
      }

      // Set previous period end date
      analyticsPrevEndDate = new Date(analyticsStartDate);
      if (isCustom) {
        analyticsPrevEndDate.setMilliseconds(analyticsEndDate.getMilliseconds() - timeDeltaInMillisecs);
      } else {
        analyticsPrevEndDate = moment(analyticsPrevEndDate).subtract(timeToGoBack, time).toDate();
      }
    },
    updateTimeframe: function(startDate, endDate) {
      // Make the dates readable
      var startDateDayD = startDate.getDate();
      var startDateMonthMMM = moment(startDate).format('MMM');
      var startDateYear = moment(startDate).format('YY');
      var endDateDayD = endDate.getDate();
      var endDateMonthMMM = moment(endDate).format('MMM');
      var endDateYear = moment(endDate).format('YY');
      var dateRangeString = startDateDayD + " " + startDateMonthMMM + " '" + startDateYear + " - " + endDateDayD + " " + endDateMonthMMM + " '" + endDateYear;
      $container.find('.analytics-date-range').html(dateRangeString);
    },
    getNewDataToRender: function(context, limit) {
      var _this = this;

      Promise.all([
        _this.getMetricsData(analyticsStartDate, analyticsEndDate, analyticsPrevStartDate, context),
        _this.getTimelineData(analyticsStartDate, analyticsEndDate, analyticsPrevStartDate, context),
        _this.getActiveUserData(analyticsStartDate, analyticsEndDate, limit),
        _this.getPopularScreenData(analyticsStartDate, analyticsEndDate, limit)
      ]).then(function(data) {
        var periodDurationInSeconds = (analyticsEndDate - analyticsStartDate);
        _this.prepareDataToRender(data, periodDurationInSeconds, context)
      }).catch(function(error) {
        console.error(error)
      });
    },
    prepareDataToRender: function(data, periodInSeconds, context) {
      var _this = this;
      pvDataArray = {
        metricsData: data[0],
        timelineData: data[1],
        activeUserData: data[2],
        popularScreenData: data[3],
        context: context,
        periodInSeconds: periodInSeconds,
        data: data
      }

      _this.storeDataToPersistantVariable();
      _this.renderData(periodInSeconds, context)
    },
    renderData: function(periodInSeconds, context) {
      // RENDER APP METRICS
      var appMetricsArrayData = [];
      pvDataArray.metricsData.forEach(function(arr, index) {
        var newObj = {};
        switch (index) {
          case 0:
            newObj['Title'] = 'Active devices';
            newObj['Prior period'] = arr.metricActiveDevicesPrior;
            newObj['Selected period'] = arr.metricActiveDevices;
            break;
          case 1:
            newObj['Title'] = 'New devices';
            newObj['Prior period'] = arr.metricNewDevicesPrior;
            newObj['Selected period'] = arr.metricNewDevices;
            break;
          case 2:
            newObj['Title'] = 'Sessions';
            newObj['Prior period'] = arr[0].count;
            newObj['Selected period'] = arr[1].count;
            break;
          case 3:
            newObj['Title'] = 'Screen views';
            newObj['Prior period'] = arr[0].count;
            newObj['Selected period'] = arr[1].count;
            break;
          case 4:
            newObj['Title'] = 'Interactions';
            newObj['Prior period'] = arr[0].count;
            newObj['Selected period'] = arr[1].count;
            break;
        }
        appMetricsArrayData.push(newObj);
      });
      $container.find('.analytics-row-wrapper-metrics').html(compiledAppMetricsTemplate(appMetricsArrayData));

      // RENDER MOST ACTIVE USERS
      switch ($container.find('[name="users-selector"]:checked').val()) {
        case 'users-sessions':
          $container.find('.analytics-row-wrapper-users').html(compiledActiveUserTemplate(pvDataArray.activeUserData[0]));
          break;
        case 'users-screen-views':
          $container.find('.analytics-row-wrapper-users').html(compiledActiveUserTemplate(pvDataArray.activeUserData[1]));
          break;
        case 'users-clicks':
          $container.find('.analytics-row-wrapper-users').html(compiledActiveUserTemplate(pvDataArray.activeUserData[2]));
          break;
      }

      // RENDER MOST POPULAR SCREENS
      switch ($container.find('[name="screen-selector"]:checked').val()) {
        case 'screens-screen-views':
          $container.find('.analytics-row-wrapper-screen').html(compiledPopularScreenTemplate(pvDataArray.popularScreenData[0]));
          break;
        case 'screens-sessions':
          $container.find('.analytics-row-wrapper-screen').html(compiledPopularScreenTemplate(pvDataArray.popularScreenData[1]));
          break;
        case 'screens-clicks':
          $container.find('.analytics-row-wrapper-screen').html(compiledPopularScreenTemplate(pvDataArray.popularScreenData[2]));
          break;
      }

      // MUTATE TIMELINE DATA
      // Active devices
      timelineActiveDevicesDataPrior = []; // Cleans it
      timelineActiveDevicesData = []; // Cleans it
      pvDataArray.timelineData[0].forEach(function(period, index) {
        switch (index) {
          case 0:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push((moment(obj[context]).unix() * 1000) + pvDataArray.periodInSeconds);
              newArray.push(parseInt(obj.uniqueDeviceTracking, 10));
              timelineActiveDevicesDataPrior.push(newArray);
            });
            break;
          case 1:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push(moment(obj[context]).unix() * 1000);
              newArray.push(parseInt(obj.uniqueDeviceTracking, 10));
              timelineActiveDevicesData.push(newArray);
            });
            break;
        }
      });
      timelineActiveDevicesDataPrior = _.orderBy(timelineActiveDevicesDataPrior, function(item) {
        return item[0];
      }, ['asc']);
      timelineActiveDevicesData = _.orderBy(timelineActiveDevicesData, function(item) {
        return item[0];
      }, ['asc']);

      // Sessions
      timelineSessionsDataPrior = []; // Cleans it
      timelineSessionsData = []; // Cleans it
      pvDataArray.timelineData[1].forEach(function(period, index) {
        switch (index) {
          case 0:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push((moment(obj[context]).unix() * 1000) + pvDataArray.periodInSeconds);
              newArray.push(parseInt(obj.sessionsCount, 10));
              timelineSessionsDataPrior.push(newArray);
            });
            break;
          case 1:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push(moment(obj[context]).unix() * 1000);
              newArray.push(parseInt(obj.sessionsCount, 10));
              timelineSessionsData.push(newArray);
            });
            break;
        }
      });
      timelineSessionsDataPrior = _.orderBy(timelineSessionsDataPrior, function(item) {
        return item[0];
      }, ['asc']);
      timelineSessionsData = _.orderBy(timelineSessionsData, function(item) {
        return item[0];
      }, ['asc']);

      // Screen views
      timelineScreenViewsDataPrior = []; // Cleans it
      timelineScreenViewsData = []; // Cleans it
      pvDataArray.timelineData[2].forEach(function(period, index) {
        switch (index) {
          case 0:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push((moment(obj[context]).unix() * 1000) + pvDataArray.periodInSeconds);
              newArray.push(parseInt(obj.count, 10));
              timelineScreenViewsDataPrior.push(newArray);
            });
            break;
          case 1:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push(moment(obj[context]).unix() * 1000);
              newArray.push(parseInt(obj.count, 10));
              timelineScreenViewsData.push(newArray);
            });
            break;
        }
      });
      timelineScreenViewsDataPrior = _.orderBy(timelineScreenViewsDataPrior, function(item) {
        return item[0];
      }, ['asc']);
      timelineScreenViewsData = _.orderBy(timelineScreenViewsData, function(item) {
        return item[0];
      }, ['asc']);

      // Interaction
      timelineInteractionsDataPrior = []; // Cleans it
      timelineInteractionsData = []; // Cleans it
      pvDataArray.timelineData[3].forEach(function(period, index) {
        switch (index) {
          case 0:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push((moment(obj[context]).unix() * 1000) + pvDataArray.periodInSeconds);
              newArray.push(parseInt(obj.count, 10));
              timelineInteractionsDataPrior.push(newArray);
            });
            break;
          case 1:
            period.data.forEach(function(obj) {
              var newArray = [];
              newArray.push(moment(obj[context]).unix() * 1000);
              newArray.push(parseInt(obj.count, 10));
              timelineInteractionsData.push(newArray);
            });
            break;
        }
      });
      timelineInteractionsDataPrior = _.orderBy(timelineInteractionsDataPrior, function(item) {
        return item[0];
      }, ['asc']);
      timelineInteractionsData = _.orderBy(timelineInteractionsData, function(item) {
        return item[0];
      }, ['asc']);

      // RENDER TIMELINE
      switch ($container.find('[name="timeline-selector"]:checked').val()) {
        case 'timeline-active-users':
          timelineChart[configuration.id].series[0].setData(timelineActiveDevicesDataPrior);
          timelineChart[configuration.id].series[1].setData(timelineActiveDevicesData);
          break;
        case 'timeline-sessions':
          timelineChart[configuration.id].series[0].setData(timelineSessionsDataPrior);
          timelineChart[configuration.id].series[1].setData(timelineSessionsData);
          break;
        case 'timeline-screen-views':
          timelineChart[configuration.id].series[0].setData(timelineScreenViewsDataPrior);
          timelineChart[configuration.id].series[1].setData(timelineScreenViewsData);
          break;
        case 'timeline-clicks':
          timelineChart[configuration.id].series[0].setData(timelineInteractionsDataPrior);
          timelineChart[configuration.id].series[1].setData(timelineInteractionsData);
          break;
      }
    },
    getMetricsData: function(currentPeriodStartDate, currentPeriodEndDate, priorPeriodStartDate, groupBy) {
      var periodDurationInSeconds = (currentPeriodEndDate - currentPeriodStartDate);
      var previousPeriodNewUsers;
      var currentPeriodNewUsers;
      var previousPeriodUsers;
      var currentPeriodUsers;

      // get active devices (for signed in users switch between _deviceTrackingId and _userEmail)
      var metricDevices = Fliplet.App.Analytics.count({
        group: ['data._deviceTrackingId'],
        where: {
          data: { _deviceTrackingId: { $ne: null } },
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodStartDate).unix() * 1000
          }
        }
      }).then(function(previousPeriod) {
        previousPeriodUsers = previousPeriod;
        // 2. get users up to end of previous period
        return Fliplet.App.Analytics.count({
          group: ['data._deviceTrackingId'],
          where: {
            data: { _deviceTrackingId: { $ne: null } },
            createdAt: {
              $gte: moment(currentPeriodStartDate).unix() * 1000,
              $lte: moment(currentPeriodEndDate).unix() * 1000
            }
          }
        }).then(function(currentPeriod) {
          currentPeriodUsers = currentPeriod
          return;
        })
      }).then(function() {
        return {
          metricActiveDevicesPrior: previousPeriodUsers,
          metricActiveDevices: currentPeriodUsers
        }
      });

      // Get new users
      var metricNewDevices = Fliplet.App.Analytics.count({
        group: ['data._deviceTrackingId'],
        where: {
          data: { _deviceTrackingId: { $ne: null } },
          createdAt: {
            $lte: moment(priorPeriodStartDate).unix() * 1000
          }
        }
      }).then(function(countUpToStartOfPriorPeriod) {
        // 2. get users up to end of previous period
        return Fliplet.App.Analytics.count({
          group: ['data._deviceTrackingId'],
          where: {
            data: { _deviceTrackingId: { $ne: null } },
            createdAt: {
              $lte: moment(currentPeriodStartDate).unix() * 1000,
            }
          }
        }).then(function(countUpToStartOfCurrentPeriod) {
          previousPeriodNewUsers = countUpToStartOfCurrentPeriod - countUpToStartOfPriorPeriod;

          // 3. get all time total count
          return Fliplet.App.Analytics.count({
            group: ['data._deviceTrackingId'],
            where: {
              data: { _deviceTrackingId: { $ne: null } },
              createdAt: {
                $lte: moment(currentPeriodEndDate).unix() * 1000,
              }
            }
          }).then(function(countUpToEndOfCurrentPeriod) {
            currentPeriodNewUsers = countUpToEndOfCurrentPeriod - countUpToStartOfCurrentPeriod;
          });
        })
      }).then(function() {
        return {
          metricNewDevicesPrior: previousPeriodNewUsers,
          metricNewDevices: currentPeriodNewUsers
        }
      });

      // Get count of sessions
      var metricSessions = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        attributes: [{ distinctCount: true, col: 'data._analyticsSessionId', as: 'sessionsCount' }],
        where: {
          data: { _analyticsSessionId: { $ne: null } },
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy,
          count: 'sessionsCount'
        }
      })

      // Get count of screen views
      var metricScreenViews = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        where: {
          type: 'app.analytics.pageView',
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy,
          count: true
        }
      })

      // Get count of interactions
      var metricInteractions = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        where: {
          type: 'app.analytics.event',
          data: {
            nonInteraction: null
          },
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy,
          count: true
        }
      })

      return Promise.all([metricDevices, metricNewDevices, metricSessions, metricScreenViews, metricInteractions]);
    },
    getTimelineData: function(currentPeriodStartDate, currentPeriodEndDate, priorPeriodStartDate, groupBy) {
      var periodDurationInSeconds = (currentPeriodEndDate - currentPeriodStartDate);
      // timeline of active devices
      var timelineDevices = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        attributes: [{ distinctCount: true, col: 'data._deviceTrackingId', as: 'uniqueDeviceTracking' }],
        where: {
          data: { _deviceTrackingId: { $ne: null } },
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy
        }
      });

      // timeline of sessions
      var timelineSessions = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        attributes: [{ distinctCount: true, col: 'data._analyticsSessionId', as: 'sessionsCount' }],
        where: {
          data: { _analyticsSessionId: { $ne: null } },
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy
        }
      })

      // timeline of screen views
      var timelineScreenViews = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        where: {
          type: 'app.analytics.pageView',
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy
        }
      })

      // timeline of interactions
      var timelineInteractions = Fliplet.App.Analytics.get({
        group: [{ fn: 'date_trunc', part: groupBy, col: 'createdAt', as: groupBy }],
        where: {
          type: 'app.analytics.event',
          data: {
            nonInteraction: null
          },
          createdAt: {
            $gte: moment(priorPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        period: {
          duration: periodDurationInSeconds / 1000, // in seconds
          col: groupBy
        }
      })

      return Promise.all([timelineDevices, timelineSessions, timelineScreenViews, timelineInteractions]);
    },
    getActiveUserData: function(currentPeriodStartDate, currentPeriodEndDate, limit) {
      var userTableSessions = Fliplet.App.Analytics.get({
        group: ['data._userEmail'],
        attributes: [{ distinctCount: true, col: 'data._analyticsSessionId', as: 'sessionsCount' }],
        where: {
          createdAt: {
            $gte: moment(currentPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        order: [
          ['sessionsCount', 'DESC']
        ],
        limit: limit
      });

      var userTableScreenViews = Fliplet.App.Analytics.get({
        group: ['data._userEmail'],
        order: [
          ['count', 'DESC']
        ],
        where: {
          type: 'app.analytics.pageView',
          createdAt: {
            $gte: moment(currentPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        limit: limit
      });

      var userTableInteractions = Fliplet.App.Analytics.get({
        group: ['data._userEmail'],
        order: [
          ['count', 'DESC']
        ],
        where: {
          type: 'app.analytics.event',
          createdAt: {
            $gte: moment(currentPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        limit: limit
      });

      return Promise.all([userTableSessions, userTableScreenViews, userTableInteractions]);
    },
    getPopularScreenData: function(currentPeriodStartDate, currentPeriodEndDate, limit) {
      var screenTableScreenViews = Fliplet.App.Analytics.get({
        group: ['data._pageId'],
        order: [
          ['count', 'DESC']
        ],
        where: {
          type: 'app.analytics.pageView',
          createdAt: {
            $gte: moment(currentPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        limit: limit
      })

      var screenTableSessions = Fliplet.App.Analytics.get({
        group: ['data._pageId'],
        attributes: [{ distinctCount: true, col: 'data._analyticsSessionId', as: 'sessionsCount' }],
        order: [
          ['sessionsCount', 'DESC']
        ],
        where: {
          type: 'app.analytics.pageView',
          createdAt: {
            $gte: moment(currentPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          }
        },
        limit: limit
      })

      var screenTableScreenInteractions = Fliplet.App.Analytics.get({
        group: ['data._pageId'],
        order: [
          ['count', 'DESC']
        ],
        where: {
          type: 'app.analytics.event',
          createdAt: {
            $gte: moment(currentPeriodStartDate).unix() * 1000,
            $lte: moment(currentPeriodEndDate).unix() * 1000
          },
          data: {
            nonInteractive: null
          }
        },
        limit: limit
      })

      return Promise.all([screenTableScreenViews, screenTableSessions, screenTableScreenInteractions]);
    },
    getUserActionData: function() {
      Fliplet.App.Analytics.get({
          where: {
            createdAt: {
              $gte: moment(analyticsStartDate).unix() * 1000,
              $lte: moment(analyticsEndDate).unix() * 1000
            }
          }
        })
        .then(function(data) {
          var pageEvents = _.filter(data, function(row) {
            return row.type === 'app.analytics.event'
          });

          var pageEventsByScreen = _.groupBy(pageEvents, 'data._userEmail');

          var tableDataArray = [];
          for (var prop in pageEventsByScreen) {
            var newObj = {};
            // skip loop if the property is from prototype
            if (!pageEventsByScreen.hasOwnProperty(prop)) continue;

            pageEventsByScreen[prop].forEach(function(event) {
              newObj['User email'] = prop;
              newObj['Event category'] = event.data.category || null;
              newObj['Event action'] = event.data.action || null;
              newObj['Event label'] = event.data.label || null;
              tableDataArray.push(newObj);
            });
          }

          if (actionsPerUserTable) {
            actionsPerUserTable.clear();
            actionsPerUserTable.rows.add(tableDataArray);
            actionsPerUserTable.draw();
          } else {
            actionsPerUserTable = $('.actions-per-user').DataTable({
              data: tableDataArray,
              columns: [
                { data: 'User email' },
                { data: 'Event category' },
                { data: 'Event action' },
                { data: 'Event label' }
              ],
              dom: 'Blfrtip',
              buttons: [
                'excel'
              ],
              responsive: {
                details: {
                  display: $.fn.dataTable.Responsive.display.childRow
                }
              }
            });
          }
        });
    },
    getScreenActionData: function() {
      Fliplet.App.Analytics.get({
          where: {
            createdAt: {
              $gte: moment(analyticsStartDate).unix() * 1000,
              $lte: moment(analyticsEndDate).unix() * 1000
            }
          }
        })
        .then(function(data) {
          var pageEvents = _.filter(data, function(row) {
            return row.type === 'app.analytics.event'
          });

          var pageEventsByScreen = _.groupBy(pageEvents, 'data._pageTitle');

          var tableDataArray = [];
          for (var prop in pageEventsByScreen) {
            var newObj = {};
            // skip loop if the property is from prototype
            if (!pageEventsByScreen.hasOwnProperty(prop)) continue;

            pageEventsByScreen[prop].forEach(function(event) {
              newObj['Screen name'] = prop;
              newObj['Event category'] = event.data.category || null;
              newObj['Event action'] = event.data.action || null;
              newObj['Event label'] = event.data.label || null;
              tableDataArray.push(newObj);
            });
          }

          if (actionsPerScreenTable) {
            actionsPerScreenTable.clear();
            actionsPerScreenTable.rows.add(tableDataArray);
            actionsPerScreenTable.draw();
          } else {
            actionsPerScreenTable = $('.actions-per-screen').DataTable({
              data: tableDataArray,
              columns: [
                { data: 'Screen name' },
                { data: 'Event category' },
                { data: 'Event action' },
                { data: 'Event label' }
              ],
              dom: 'Blfrtip',
              buttons: [
                'excel'
              ],
              responsive: {
                details: {
                  display: $.fn.dataTable.Responsive.display.childRow
                }
              }
            });
          }
        });
    },
    renderTable: function(data, context) {
      tableDataArray = [];
      data[configTableContext[context].dataIndex].forEach(function(row) {
        var newObj = {};
        newObj[configTableContext[context].tableRows[0].key] = row[configTableContext[context].tableRows[0].value] || null;
        newObj[configTableContext[context].tableRows[1].key] = row[configTableContext[context].tableRows[1].value] || null;
        tableDataArray.push(newObj);
      });
      if (configTableContext[context].table) {
        configTableContext[context].table.clear();
        configTableContext[context].table.rows.add(tableDataArray);
        configTableContext[context].table.draw();
      } else {
        configTableContext[context].table = $(configTableContext[context].tableSelector).DataTable({
          data: tableDataArray,
          columns: configTableContext[context].tableColumns,
          dom: 'Blfrtip',
          buttons: [
            'excel'
          ],
          responsive: {
            details: {
              display: $.fn.dataTable.Responsive.display.childRow
            }
          }
        });
      }
      if (configTableContext[configTableContext[context].otherTableOne].table) {
        configTableContext[configTableContext[context].otherTableOne].table.destroy();
        configTableContext[configTableContext[context].otherTableOne].table = null;
      }
      if (configTableContext[configTableContext[context].otherTableTwo].table) {
        configTableContext[configTableContext[context].otherTableTwo].table.destroy();
        configTableContext[configTableContext[context].otherTableTwo].table = null;
      }
      $container.find(configTableContext[context].selectorsToShow).removeClass('hidden');
      $container.find(configTableContext[context].selectorsToHide).addClass('hidden');
    },
    getMoreActiveUsers: function() {
      var _this = this;
      var buttonSelected = $('[name="users-selector"]:checked').val();

      _this.getActiveUserData(analyticsStartDate, analyticsEndDate)
        .then(function(data) {
          switch (buttonSelected) {
            case 'users-sessions':
              _this.renderTable(data, buttonSelected);
              break;
            case 'users-screen-views':
              tableDataArray = [];
              _this.renderTable(data, buttonSelected);
              break;
            case 'users-clicks':
              _this.renderTable(data, buttonSelected);
              break;
          }
        });
    },
    getMorePopularScreens: function() {
      var _this = this;
      var buttonSelected = $('[name="screen-selector"]:checked').val();

      _this.getPopularScreenData(analyticsStartDate, analyticsEndDate)
        .then(function(data) {
          switch (buttonSelected) {
            case 'screens-screen-views':
              _this.renderTable(data, buttonSelected);
              break;
            case 'screens-sessions':
              _this.renderTable(data, buttonSelected);
              break;
            case 'screens-clicks':
              _this.renderTable(data, buttonSelected);
              break;
          }
        });
    },
    start: function() {
      var _this = this;
      var dateSelectModeDefault = dateSelectMode || 'last-7-days';
      var selectors = [
        '[name="date-selector"][value="'+ dateSelectModeDefault +'"]',
        '[name="timeline-selector"][value="timeline-active-users"]',
        '[name="users-selector"][value="users-sessions"]',
        '[name="screen-selector"][value="screens-screen-views"]'
      ].join(', ');

      _this.attachEventListeners();

      // Selects radio buttons by default
      $container.find(selectors).prop('checked', true);

      // Load timeline chart
      _this.chartInitialization(chartContainer, chartConfiguration);

      // Run once on load
      _this.getDataFromPersistantVariable();
    }
  }
});