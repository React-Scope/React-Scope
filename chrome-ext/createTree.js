import * as d3 from 'd3';
import { parseSvg } from "d3-interpolate/src/transform/parse";
import $ from 'jquery';

var treeData;
var checkData;
// Set the dimensions and margins of the diagram
var margin = { top: 90, right: 90, bottom: 90, left: 90 },
  width = 960 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom,
  center = [width / 2, height / 2],
  focus = center;
var i = 0,
  duration = 750,
  rectH = 30,
  rectW = 60,
  root;

//test
const minZoom = 0.05; // min zoom distance
const maxZoom = 2; // max zoom distance

//test
const zoom = d3.zoom()
  .scaleExtent([minZoom, maxZoom])
  .on('zoom', zoomed);

var svg = d3
  .select('#tree')
  .append('svg')
  .classed('svg-container', true) //test
  .classed('svg-content-responsive', true) //test
  .attr('preserveAspectRatio', 'xMinyMin meet')
  .attr('viewBox', `0 0 ${height} ${width}`)
  .call(
    d3
      .zoom()
      .scaleExtent([1 / 2, 6])
      .on('zoom', zoomed)
  )
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + margin.top + ')');

  function zoomed() {
  svg.attr('transform', d3.event.transform);
  /*
  // this is intended to start the zoom at center where the current node is 
  var transform = d3.event.transform,
      point = transform.invert(center);
      console.log("point",point, "focus", focus)
  transform = transform.translate(point[0] - focus[0], point[1] - focus[1]);
  svg.attr("transform", transform);
  */
}

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

// declares a tree layout and assigns the size
var treemap = d3.tree().nodeSize([170, 170]);
function createTree(data) {
  treeData = data;
  // Assigns parent, children, height, depth
  root = d3.hierarchy(treeData, function(d) {
    return d.children;
  });

  //form x and y axis
  root.x0 = width / 2;
  root.y0 = height / 2;

  // Collapse after the second level
  // root.children.forEach(collapse);

  update(root);
}

// Collapse the node and all it's children
function getText(node) {
  var textsize = 12;
  var maxChar = rectW / textsize;

  var text = node.name;

  if (node.node_id == 'dummy_node') {
    return '';
  } else {
    return text;
  }
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr('x'),
      y = text.attr('y'),
      dy = 0, //parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append('tspan')
        .attr('x', x)
        .attr('y', y)
        .attr('dy', dy + 'em');
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', ++lineNumber * lineHeight + dy + 'em')
          .text(word);
      }
    }
  });
}

function update(source) {
  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var rootNode = treeData.descendants()[0];
  var nodes = treeData.descendants().slice(1),
    links = treeData.descendants().slice(rootNode.children.length + 1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    //if(d.depth == 1){
    d.y = d.depth * 180;
    //}else{
    //  d.y = d.depth * 40;
    //}
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node').data(nodes, function(d) {
    return d.id || (d.id = ++i);
  });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + source.x + ',' + source.y + ')';
    })
    .on('click', click);

  // Add Rectangle for the nodes
  nodeEnter
    .append('rect')
    .attr('x', -70) //text position
    .attr('y', -120)
    .attr('width', 200)
    .attr('height', 100)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('id', function(d) {//test
      return d.data.id
  })
    .on('mouseover', function(d) {
      d3
        .selectAll('rect')
        .style('stroke-width', 1)
        .style('stroke', 'black');
      d3
        .select(this)
        .style('stroke-width', 5)
        .style('stroke', '#f62459');
      $('#nodeData').empty();
      $('#nodeData').append(
        `<h5>Name</h5> <p>${JSON.stringify(d.data.name, null, 2)}</p>`
      );
      if (!d.data.store) {
        $('#nodeData').append(
          `<h5>State</h5> <p>${JSON.stringify(d.data.state, null, 2)}</p>`
        );
      } 
      else {
        $('#nodeData').append(
          `<h5>Store</h5> <p>${JSON.stringify(d.data.store, null, 2)}</p>`
        );
      }
      $('#nodeData').append(
        `<h5>Props</h5> <p>${JSON.stringify(d.data.props, null, 2)}</p>`
      );
    })
    .style('fill', function(d) {
      return d._children ? '#DADFE1' : '#fff';
    });

  // Add labels for the nodes
  // box size
  nodeEnter
    .append('text')
    .attr('x', 0)
    .attr('y', -40)
    .attr('width', 150 + 20)
    .attr('dy', '.35em')
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d.data.name;
    })
    .call(wrap, 80);
  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  // Update the node attributes and style
  nodeUpdate
    .select('rect')
    .attr('width', 150)
    .attr('height', 150)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .style('fill', function(d) {
      return d._children ? '#DADFE1' : '#fff';
    })
    .attr('cursor', 'pointer');

  nodeUpdate.select('text').style('fill-opacity', 1);

  // Remove any exiting nodes
  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr('transform', function(d) {
      return 'translate(' + source.x + ',' + source.y + ')';
    })
    .remove();

  // On exit reduce the node circles size to 0

  nodeExit
    .select('rect')
    .attr('x', -70)
    .attr('y', -70)
    .attr('width', 150)
    .attr('height', 150)
    .attr('stroke', 'black')
    .attr('stroke-width', 1);

  // On exit reduce the opacity of text labels
  nodeExit.select('text').style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link').data(links, function(d) {
    return d.id;
  });

  // Enter any new links at the parent's previous position.
  var linkEnter = link
    .enter()
    .insert('path', 'g')
    .attr('class', 'link')
    .attr('d', function(d) {
      var o = { x: source.x, y: source.y };
      return diagonal(o, o);
    });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(duration)
    .attr('d', function(d) {
      return diagonal(d, d.parent);
    });

  // Remove any exiting links
  var linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = { x: source.x, y: source.y };
      return diagonal(o, o);
    })
    .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x * 2;
    d.y0 = d.y * 2;
  });
}

// Creates a curved (diagonal) path from parent to the child nodes
function diagonal(s, d) {
  const path = `M ${s.x} ${s.y}
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`;

  return path;
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

  export function createTree(data, optData) {
    treeData = data;
    checkData = optData
    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) { return d.children; });
      
    //form x and y axis
    root.x0 = width/2;
    root.y0 = height/2;
    
    
    // Collapse after the second level
    // root.children.forEach(collapse);
    
    update(root);
    };

  export function zoomIn() {
    const currentTransform = d3.select('.svg-content-responsive > g').attr('transform');
    const { translateX, translateY, scaleX } = parseSvg(currentTransform);
    let newZoom = scaleX * 1.5;
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
  
    const transform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(newZoom);
    d3.select('.svg-content-responsive').transition().duration(1).call(zoom.transform, transform);
  }
  
  /** Zooms out D3 graph */
  export function zoomOut() {
    const currentTransform = d3.select('.svg-content-responsive > g').attr('transform');
    const { translateX, translateY, scaleX } = parseSvg(currentTransform);
    let newZoom = scaleX / 1.5;
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
  
    const transform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(newZoom);
    d3.select('.svg-content-responsive').transition().duration(1).call(zoom.transform, transform);
  }
  
// export default createTree;
