/*
* Data Visualization - Framework
* Copyright (C) University of Passau
*   Faculty of Computer Science and Mathematics
*   Chair of Cognitive sensor systems
* Maintenance:
*   2024, Alexander Gall <alexander.gall@uni-passau.de>
*
* All rights reserved.
*/

// Use this website as a motivation: https://observablehq.com/framework/examples/eia/
// TODO: File for Part 2
// TODO: You can edit this file as you wish - add new methods, variables etc. or change/delete existing ones.

// TODO: use descriptive names for variables
let chart1, chart2, chart3, chart4;

function initDashboard(_data) {
    // Define width and height for SVG containers
    const width = 975;
    const height = 610;

    // Initialize the environment (SVG, etc.) and call the needed methods
    chart1 = d3.select("#chart1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");
        /*
*    Mastering Data Visualization with D3.js
*    Gapminder Clone
*/

document.getElementById('upload').addEventListener('change',function(event){
    if(file){
        const reader = new FileReader();
        reader.onload=function(e){
            const csvData = e.target.result;
            const data=d3.csvParse(csvData);
            console.log(data);
        };
        // reader.readAsText(file);
    }
});

var margin = { left:80, right:20, top:50, bottom:100 };
// var height = 500 - margin.top - margin.bottom, 
//     width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + 
            ", " + margin.top + ")");

var time = 0;

// Scales
var x = d3.scaleLog()
    .base(10)
    .range([0, width])
    .domain([142, 150000]);
var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 90]);
var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

// Labels
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy (Years)")
var timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");

// X Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")")
    .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);

d3.json('https://raw.githubusercontent.com/ioanmeri/resources/master/GapminderClone.json').then(function(data){
    console.log(data);

    // Clean data
    const formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;            
        })
    });

    // Run the code every 0.1 second
    d3.interval(function(){
        // At the end of our data, loop back
        time = (time < 214) ? time+1 : 0
        update(formattedData[time]);            
    }, 100);

    // First run of the visualization
    update(formattedData[0]);

})

function update(data) {
    // Standard transition time for the visualization
    var t = d3.transition()
        .duration(100);

    // JOIN new data with old elements.
    var circles = g.selectAll("circle").data(data, function(d){
        return d.country;
    });

    // EXIT old elements not present in new data.
    circles.exit()
        .attr("class", "exit")
        .remove();

    // ENTER new elements present in new data.
    circles.enter()
        .append("circle")
        .attr("class", "enter")
        .attr("fill", function(d) { return continentColor(d.continent); })
        .merge(circles)
        .transition(t)
            .attr("cy", function(d){ return y(d.life_exp); })
            .attr("cx", function(d){ return x(d.income) })
            .attr("r", function(d){ return Math.sqrt(area(d.population) / Math.PI) });

    // Update the time label
    timeLabel.text(+(time + 1800))
}

    chart2 = d3.select("#chart2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    chart3 = d3.select("#chart3").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    chart4 = d3.select("#chart4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    createChart1(_data);
    createChart2(_data);
    createChart3(_data);
    createChart4(_data);
}

function createChart1(_data) {
    const data = _data.population.map((d) => ({
        ...d,
        county: _data.countymap.get(d.fips),
        state: _data.statemap.get(d.state)
    }))
    .filter(d => d.county)
    .sort((a, b) => d3.descending(a.population, b.population));

    const radius = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.population)])
        .range([0, 40]);

    const path = d3.geoPath();

    const svg = d3.select("#chart1 svg")
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "width: 100%; height: auto; height: intrinsic;");

    svg.append("path")
        .datum(topojson.feature(_data.us, _data.us.objects.nation))
        .attr("fill", "#ddd")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(_data.us, _data.us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);

    const legend = svg.append("g")
        .attr("fill", "#777")
        .attr("transform", "translate(915,608)")
        .attr("text-anchor", "middle")
        .style("font", "10px sans-serif")
        .selectAll("g")
        .data(radius.ticks(4).slice(1))
        .join("g");

    legend.append("circle")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("cy", d => -radius(d))
        .attr("r", radius);

    legend.append("text")
        .attr("y", d => -2 * radius(d))
        .attr("dy", "1.3em")
        .text(radius.tickFormat(4, "s"));

    const format = d3.format(",.0f");
    svg.append("g")
        .attr("fill", "brown")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("transform", d => `translate(${centroid(d.county)})`)
        .attr("r", d => radius(d.population))
        .append("title")
        .text(d => `${d.county.properties.name}, ${d.state.properties.name}\n${format(d.population)}`);
}

function createChart2(_data) {
    // Add logic for chart 2
}

function createChart3(_data) {
    // Add logic for chart 3
}

function createChart4(_data) {
    // Add logic for chart 4
}

// Clear charts if changes (dataset) occur
function clearDashboard() {
    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart3.selectAll("*").remove();
    chart4.selectAll("*").remove();
}



