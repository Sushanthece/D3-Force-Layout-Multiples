
var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var n = 200,
    m = 10,
    padding = 6,
    radius = d3.scale.sqrt().range([0, 12]),
    color = d3.scale.category10().domain(d3.range(m)),
    x = d3.scale.ordinal().domain(d3.range(m)).rangeBands([0, width]);

var nodes = d3.range(n).map(function() {
  var i = Math.floor(Math.random() * m),
      v = (i + 1) / m * -Math.log(Math.random());
  return {
    radius: radius(v),
    color: color(i)
  };
});

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.nest()
    .key(function(d) { return d.color; })
    .entries(nodes)
    .forEach(force);

function force(entry, i) {
  var nodes = entry.values;

  var force = d3.layout.force()
      .nodes(nodes)
      .size([x.rangeBand(), height])
      .gravity(.2)
      .charge(0)
      .on("tick", tick)
      .start();

  var circle = svg.append("g")
      .attr("transform", "translate(" + x(i) + ")")
    .selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return d.color; })
      .call(force.drag);

  function tick(e) {
    circle
        .each(collide(.5))
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  // Resolves collisions between d and all other circles.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + radius.domain()[1] + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
      });
    };
  }
}
