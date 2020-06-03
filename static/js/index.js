$(document).ready(function() {                         
  $("#petInfoOverlay").modal({
    escapeClose: false,
    clickClose: false,
    showClose: false,
    fadeDuration: 200
  });

  $("#formPetInfo").submit(function(e) {
    e.preventDefault();
    $("#petInfoOverlay").modal("hide");
    $('.jquery-modal').hide();
    return false;
  });
  
  var getMonthCaption = function(month) {
    monthCaptions = [
      'January', 
      'February', 
      'March', 
      'April', 
      'May', 
      'June', 
      'July', 
      'August', 
      'September', 
      'October', 
      'November', 
      'December'
    ];
    return monthCaptions[month];
  };

  let monthVal = new Date().getMonth();
  let isStateMap = true;
  let mapKey = 'countries/us/us-all';
  let zipcode = '';
  let email = '';

  $("#btnSwitchToStateMap").on('click', function(e) {
    e.preventDefault();
    $('#switchButtonPanel').hide();
    $('#userInfoPanel').show();
    $('#textMapTitle').text("Search flea risk info about your area");
    isStateMap = true;
    mapKey = 'countries/us/us-all';
    updateFleaRiskMap();
  });

  $("#formUserInfo").submit(function(e) {
    e.preventDefault();
    
    zipcode = $("#zipcode").val();
    $.ajax({
      type: "POST",
      url: "/api/zipcodes/validate",
      data: JSON.stringify({
        zipcode: zipcode
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
      success: function (data) {  
        if(data['valid']) {
          mapKey = 'countries/us/' + 'us-' + data['state'].toLowerCase() + '-all';
          $("#userEmailOverlay").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false,
            fadeDuration: 200
          });

        } else {
          alert('Invalid zipcode! Please input valid one.');
        }
      },
      failure: function (response) {
        console.log("Error");
      }
    });

    return false;
  });

  // Handling email submission
  $("#formUserEmail").submit(function(e) {
    e.preventDefault();
    $("#userEmailOverlay").modal("hide");
    $('.jquery-modal').hide();

    // Show the spinner
    chart.showLoading('<i class="icon-spinner icon-spin icon-3x"></i> Loading...');
    
    // Handling script loading failure
    var fail = setTimeout(function () {
      if (!Highcharts.maps[mapKey]) {
        mapKey = 'countries/us/us-all';
        chart.showLoading('<i class="icon-frown"></i> Failed loading');
        fail = setTimeout(function () {
          chart.hideLoading();
        }, 1000);
        updateFleaRiskMap();
      }
    }, 20000);

    // Load script data of state that the zipcode belongs to
    $.getScript('https://code.highcharts.com/mapdata/' + mapKey + '.js', function () {
      isStateMap = false;
      $('#switchButtonPanel').show();
      $('#userInfoPanel').hide();
      $('#textMapTitle').text("Flea risk in your area");

      // Hide loading
      chart.hideLoading();
      clearTimeout(fail);

      // Get email address
      email = $("#email").val();

      // Update map
      updateFleaRiskMap();
    });

    return false;
  });

  // Handling cancellation of email submission
  $("#userEmailOverlay").on("hidden.bs.modal", function(e) {
    console.log('1');
  });

  // Instantiate the map
  chart = new Highcharts.mapChart('mapPanel', {
    chart: {
      map: mapKey,
    },

    title: false,

    exporting: {
      enabled: false
    },

    legend: {
      layout: 'vertical',
      backgroundColor: 'rgba(255,255,255,0.85)',
      floating: true,
      align: 'right',
      verticalAlign: 'middle'
    },

    mapNavigation: {
      enabled: true
    },

    colorAxis: {
      min: 1,
      max: 10,
      minColor: '#CECECF',
      maxColor: '#003049'
    },

    series: [{
      animation: {
        duration: 1000
      },
      joinBy: ['postal-code', 'code'],
      dataLabels: {
        enabled: true,
        color: '#FFFFFF',
        format: '{point.code}'
      },
      data: [],
      name: 'Flea Risk',
      tooltip: {
        pointFormat: '{point.code}: {point.value}'
      }
    }],

    credits: {
      enabled: false
    }
  });
  
  let mapColors = [
    {
      from: 1,
      to: 3,
      color: '#F3DE2C'
    }, {
      from: 4,
      to: 6,
      color: '#F7B501'
    }, {
      from: 7,
      to: 8,
      color: '#FA6400'
    }, {
      from: 9,
      to: 10,
      color: '#C10000'
    }
  ];
  
  updateFleaRiskMap = function() {
    if(isStateMap) {
      // state-wise map
      // Instantiate the map
      chart = new Highcharts.mapChart('mapPanel', {
        chart: {
          map: mapKey,
          spacingBottom: 50
        },

        title: false,

        exporting: {
          enabled: false
        },

        legend: {
          itemStyle: {"color": "#333333", "cursor": "pointer", "fontSize": "20px", "fontWeight": "bold", "textOverflow": "ellipsis"},
          itemDistance: 60,
          align: 'center',
          horizontalAlign: 'bottom',
          layout: 'horizontal',
          backgroundColor: 'transparent',
          floating: true,
          y: 50
        },

        mapNavigation: {
          enabled: true
        },

        colorAxis: {
          dataClasses: [{
            from: 1,
            to: 3,
            color: '#F3DE2C',
            name: 'Low'
          }, {
            from: 4,
            to: 6,
            color: '#F7B501',
            name: 'Mild'
          }, {
            from: 7,
            to: 8,
            color: '#FA6400',
            name: 'Moderate'
          }, {
            from: 9,
            to: 10,
            color: '#C10000',
            name: 'Severe'
          }]
        },

        series: [{
          animation: {
            duration: 1000
          },
          joinBy: ['postal-code', 'code'],
          dataLabels: {
            enabled: true,
            color: '#FFFFFF',
            format: '{point.code}'
          },
          data: [],
          name: 'Flea Risk',
          tooltip: {
            pointFormat: '{point.code}: {point.value}'
          },
          borderColor: 'white'
        }],

        credits: {
          enabled: false
        }
      });
    
      // get data, display
      $.ajax({
        type: "POST",
        url: "/api/weatherhistory/states",
        data: JSON.stringify({
          month: monthVal
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (data) {  
          chart.series[0].update({
            data: data
          })
        },
        failure: function (response) {
          console.log("Error");
        }
      });
    } else {
      // get data, display
      $.ajax({
        type: "POST",
        url: "/api/weatherhistory/zipcode",
        data: JSON.stringify({
          month: monthVal,
          zipcode: zipcode,
          email: email
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (response) {  
          data = Highcharts.geojson(Highcharts.maps[mapKey]);
          $.each(data, function (i) {
            this.value = response['value'];
          });

          let colorIndex = 0;
          mapColors.forEach(function(color, index) {
            if(color['from'] <= response['value'] && color['to'] >= response['value']){
              colorIndex = index;
            }
          });

          chart = Highcharts.mapChart('mapPanel', {
            chart: {
              map: mapKey
            },
            
            title: {
              text: response['title']
            },
            
            exporting: {
              enabled: false
            },

            mapNavigation: {
              enabled: true
            },

            tooltip: {
              headerFormat: '',
              pointFormat: '<b>{point.name}</b><br>Flea Risk: {point.value}'
            },

            legend: {
              enabled: false
            },

            series: [{
              name: 'Basemap',
              nullColor: mapColors[colorIndex]['color'],
              showInLegend: false,
              data: [],
              color: mapColors[colorIndex]['color'],
              dataLabels: {
                enabled: true,
                format: '{point.name}'
              },
              enableMouseTracking: true,
              borderColor: 'white'
            }, {
              name: 'Separators',
              type: 'mapline',
              nullColor: '#707070',
              showInLegend: false,
              enableMouseTracking: false
            }, {
              // Specify points using lat/lon
              type: 'mappoint',
              name: 'Your Area',
              color: 'blue',
              marker: {
                radius: 8
              },
              data: [response]
            }],

            credits: {
              enabled: false
            }
          });
        },
        failure: function (response) {
          console.log("Error");
        }
      });
    }
  }

  var monthCaption = $("#monthCaption");
  $("#month").slider({
    min: 0,
    max: 11,
    value: new Date().getMonth(),
    create: function() {
      monthVal = $(this).slider("value");
      monthCaption.text(getMonthCaption(monthVal));
      updateFleaRiskMap();
    },
    slide: function(event, ui) {
      monthVal = ui.value;
      monthCaption.text(getMonthCaption(monthVal));
      updateFleaRiskMap();
    }
  });
});

