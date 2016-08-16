$(function() {
    var seriesOptions = [];
    var seriesCounter = 0;
    var names;
    var chart;
    var socket = io();
    
    $.getJSON('https://stocks-jesse989.c9users.io/api', function(data) {
        names = data;

        $.each(names, function(i, name) {

            $.getJSON('https://stocks-jesse989.c9users.io/api/' + name, function(data) {
    
                seriesOptions[i] = {
                    name: name,
                    data: data
                };

                // As we're loading the data asynchronously, we don't know what order it will arrive. So
                // we keep a counter and create the chart when all the data is loaded.
                seriesCounter += 1;

                if (seriesCounter === names.length) {
                    createChart();
                    chart = $('#container').highcharts();
                }
            });
        });
    });

    function createChart() {

        chart = $('#container').highcharts('StockChart', {

            rangeSelector: {
                selected: 4
            },

            yAxis: {
                labels: {
                    formatter: function() {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },

            plotOptions: {
                series: {
                    compare: 'percent'
                }
            },

            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2
            },

            series: seriesOptions
        });
    }



    
    var add_series = function(name, chart_series, cb) {
        var counter = 0;
        $.each(chart_series, function(index) {
            if (chart_series[index].name !== name) {
                counter++;
                if (counter + 1 === chart_series.length) {
                    $.getJSON('https://stocks-jesse989.c9users.io/api/' + name, function(data) {
                            return cb(data);
                    });
                }
            }
        });
    };


    var remove_series = function(name, chart_series, cb) {
        $.each(chart_series, function(index) {
            if (chart_series[index].name === name) {
                return cb(index);
            }
        });
    };

    $('#add_button, #remove_button').on('click', function() {
        var name = $('#symbol_input').val().toUpperCase();
        $('#symbol_input').val('');
        if ($(this).attr('id') === 'add_button') {
            socket.emit('add_series', name);
        }
        else if ($(this).attr('id') === 'remove_button') {
            socket.emit('delete_series', name);
        }
    });
    
    socket.on('add_series', function(name) {
        add_series(name, chart.series, function(data) {
            chart.addSeries({
                name: name,
                data: data
            });
            update_symbols(chart.series);
        });
    });
    
    socket.on('delete_series', function(name) {
        remove_series(name, chart.series, function(index) {
            chart.series[index].remove();
            update_symbols(chart.series);
        });
    });
    
    var update_symbols = function(symbols){
        var symbol_array = '';
        $.each(symbols, function(index){
            if(symbols[index].name !== 'Navigator'){
                symbol_array += ('stocks='+ symbols[index].name + '&');
            }
        });

        $.ajax({
            url: 'https://stocks-jesse989.c9users.io/api',
            type: 'POST',
            data: symbol_array,
            success: function(data) {
            }
        });
    };
});