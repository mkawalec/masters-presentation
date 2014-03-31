var _   = require("lodash"),
    d3  = require("d3"),
    $   = require("jquery");

var pres = impress();
pres.init();

function parse_datafile(data) {
    return _.filter(_.map(data.split('\n'), function(line) {
        return _.map(line.split(' '), function(num) {
                    return parseFloat(num);
                });
            })
        , function(l) { return l.length > 1;}
    );
}

function add_plot(args) {
    var placeholder = args.slide.find('.plot');

    $.get("static/" + placeholder.attr('id'), function(data) {
        var coords = parse_datafile(data),
            margin = {bottom: 50, left: 70},
            width = placeholder.width() - 2 * margin.left,
            height = placeholder.height() - 2 * margin.bottom;

        var x = d3.scale.linear().range([0, width]),
            y = d3.scale.linear().range([height, 0]),
            x_axis = d3.svg.axis().scale(x).orient('bottom').ticks(7),
            y_axis = d3.svg.axis().scale(y).orient('left');

        var line = d3.svg.line()
            .x(function(d) { return x(d[args.xcol]);})
            .y(function(d) { return y(d[args.ycol]);});

        var svg = d3.select(placeholder[0]).append('svg')
            .attr('width', width + 2 * margin.left)
            .attr('height', height + 2 * margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.bottom + ')');

        x.domain(d3.extent(coords, function(d) { return d[args.xcol];}));
        y.domain(d3.extent(coords, function(d) { return d[args.ycol];}));

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + height + ')')
            .call(x_axis)
            .append('text')
            .attr('class', 'label')
            .attr('x', width - 50)
            .attr('y', '0.9em')
            .attr("dx", "1em")
            .style('text-anchor', 'end')
            .text(args.xlabel);

        svg.append('g')
            .attr('class', 'y axis')
            .call(y_axis)
            .append('text')
            .attr('class', 'label')
            .attr('y', "-1.2em")
            .attr('x', "-0.5em")
            .attr("dy", ".71em")
            .style('text-anchor', 'end')
            .text(args.ylabel);

        var paths = [svg.append('path')
            .datum(coords)
            .attr('class', 'line')
            .attr('d', line)];

        if (args.paths !== undefined) {
            paths = paths.concat(_.map(args.paths, function(path, n) {
                return svg.append('path')
                    .datum(path(coords))
                    .attr('class', 'line path-' + n)
                    .attr('d', line);
            }));
        }

        console.log(paths);
        _.forEach(paths, function(path) {
            var path_length = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', path_length + ' ' + path_length)
                .attr('stroke-dashoffset', path_length);
        });

        args.slide.on('impress:stepenter', function() {
            _.forEach(paths, function(path) {
                path
                    .transition()
                        .duration(2000)
                    .ease('linear')
                    .attr('stroke-dashoffset', 0);
            });
        });
        args.slide.on('impress:stepleave', function() {
            _.forEach(paths, function(path) {
                var path_length = path.node().getTotalLength();
                path
                    .transition()
                        .duration(2000)
                    .ease('linear')
                    .attr('stroke-dashoffset', path_length);
            });
        });

    });
}

add_plot({slide: $('#samplerun'),
          ylabel: "u",
          xlabel: 't',
          xcol: 0,
          ycol: 1
});

add_plot({slide: $('#survprob'),
          ylabel: "S",
          xlabel: 't',
          xcol: 0,
          ycol: 1,
          paths: [function(coords) {
              return _.map(coords, function(coord) {
                  return [coord[0], 0.9018 * Math.exp(-0.0012067 * coord[0])];
              });
          }]
});

