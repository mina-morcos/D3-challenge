// def run(server_class=HTTPServer, handler_class=BaseHTTPRequestHandler):
//     server_address = ('', 8000)
//     httpd = server_class(server_address, handler_class)
//     httpd.serve_forever()

// Set up SVG definitions
var svgWidth = 960;
var svgHeight = 600;

// Set up borders in svg
var margin = {
  top: 20, 
  right: 40, 
  bottom: 200,
  left: 100
};

// Chart height and width
var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append div class to scatter element
var chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

// Append svg element to chart 
var svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

// Append svg group
var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

// params
var chosenXAxis = 'poverty';
var chosenYAxis = 'healthcare';

// Updating x-scale variable upon label click
function xScale(censusData, chosenXAxis) {
    //scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
        d3.max(censusData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;
}

// Updating the xxaxis click
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Updating y-scale variable upon label click
function yScale(censusData, chosenYAxis) {
  // Scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}

// Updating yaxis click
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
}

// Updating circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr('cx', d => newXScale(data[chosenXAxis]))
      .attr('cy', d => newYScale(data[chosenYAxis]))

    return circlesGroup;
}

// Updating state labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
}
// Stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

    // Style based on variable
    //poverty
    if (chosenXAxis === 'poverty') {
        return `${value}%`;
    }
    // Household income
    else if (chosenXAxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

// Updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var label;
    // Poverty
    if (chosenXAxis === 'poverty') {
      var xLabel = 'Poverty:';
    }
    // Income
    else if (chosenXAxis === 'income'){
      var xLabel = 'Median Income:';
    }
    // Age
    else {
      var xLabel = 'Age:';
    }

  //Y label
  // Healthcare
  if (chosenYAxis ==='healthcare') {
    var yLabel = "No Healthcare:"
  }
  else if(chosenYAxis === 'obesity') {
    var yLabel = 'Obesity:';
  }
  // Smoking
  else{
    var yLabel = 'Smokers:';
  }

  // tooltip
  var toolTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
  });

  circlesGroup.call(toolTip);

  circlesGroup.on('mouseover', function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on('mouseout', function(data, index) {
      toolTip.hide(data);
    });


    return circlesGroup;
}
// Retrieve data
d3.csv('./assets/data/data.csv').then(function(censusData, err) {
  if (err) throw err;

    console.log(censusData);
    
    //Parse data
    censusData.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // linear scales
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);

    
    // x axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append X
    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    //append Y
    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      //.attr
      .call(leftAxis);
    
    //append Circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(censusData)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', 14)
      .attr('opacity', '.5');

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(censusData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});

    //create group for the x axis labels
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty (%)');
      
    var ageLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');  

    var incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

    //create group for Y labels
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');
    
    //update tooltip
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis event listener
    xLabelsGroup.selectAll('text')
      .on('click', function() {
        // Value of selection
        var value = d3.select(this).attr('value');

        if (value != chosenXAxis) {

          // Replace chosen x with a value
          chosenXAxis = value; 

          console.log(chosenXAxis)

          // Update x for new data
          xLinearScale = xScale(censusData, chosenXAxis);

          // update x transition
          xAxis = renderXAxis(xLinearScale, xAxis);

          // Upate circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // Update text 
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          //Update tooltip
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // Change of classes changes text
          if (chosenXAxis === 'poverty') {
            povertyLabel
            .classed('active', true)
            .classed('inactive', false);
            ageLabel
            .classed('active', false)
            .classed('inactive', true);
            incomeLabel
            .classed('active', false)
            .classed('inactive', true);
          }
          else if (chosenXAxis === 'age') {
            povertyLabel
            .classed('active', false)
            .classed('inactive', true);
            ageLabel
            .classed('active', true)
            .classed('inactive', false);
            incomeLabel
            .classed('active', false)
            .classed('inactive', true);
          }
          else {
            povertyLabel
            .classed('active', false)
            .classed('inactive', true);
            ageLabel
            .classed('active', false)
            .classed('inactive', true);
            incomeLabel.
            classed('active', true)
            .classed('inactive', false);
          }
        }
      });

    // Y axis lables event listener
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=chosenYAxis) {
            // Replace chosenY with value  
            chosenYAxis = value;

            // Update Y scale
            yLinearScale = yScale(censusData, chosenYAxis);

            // Update Y axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            // Update circles with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update text with new Y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update tooltips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Change of classes changes text
            if (chosenYAxis === 'obesity') {
              obesityLabel
              .classed('active', true)
              .classed('inactive', false);
              smokesLabel
              .classed('active', false)
              .classed('inactive', true);
              healthcareLabel
              .classed('active', false)
              .classed('inactive', true);
            }
            else if (chosenYAxis === 'smokes') {
              obesityLabel
              .classed('active', false)
              .classed('inactive', true);
              smokesLabel
              .classed('active', true)
              .classed('inactive', false);
              healthcareLabel
              .classed('active', false)
              .classed('inactive', true);
            }
            else {
              obesityLabel
              .classed('active', false)
              .classed('inactive', true);
              smokesLabel
              .classed('active', false)
              .classed('inactive', true);
              healthcareLabel
              .classed('active', true)
              .classed('inactive', false);
            }
          }
        });
      }).catch(function(error) {
        console.log(error);
});