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

// Important Websites used:
//https://sabahatiqbal.medium.com/building-a-scatter-plot-with-d3-js-66178fde56ac
//https://medium.com/@john.goodman/getting-started-with-d3-js-6de226320878
//
// scatterplot axes
let xAxis, yAxis, xAxisLabel, yAxisLabel;
// radar chart axes
let radarAxes, radarAxesAngle;

let dimensions = ["dimension 1", "dimension 2", "dimension 3", "dimension 4", "dimension 5", "dimension 6"];
//*HINT: the first dimension is often a label; you can simply remove the first dimension with
// dimensions.splice(0, 1);

// the visual channels we can use for the scatterplot
let channels = ["scatterX", "scatterY", "size"];

// size of the plots
let margin, width, height, radius;
// svg containers
let scatter, radar, dataTable;

// Add additional variables
let x, y, r, data;

function init() {
    // define size of plots
    margin = {top: 20, right: 20, bottom: 20, left: 50};
    width = 600;
    height = 500;
    radius = width / 2;

    // Start at default tab
    document.getElementById("defaultOpen").click();

	// data table
	dataTable = d3.select('#dataTable');

    // scatterplot SVG container and axes
    scatter = d3.select("#sp").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // radar chart SVG container and axes
    radar = d3.select("#radar").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // read and parse input file
    let fileInput = document.getElementById("upload"), readFile = function () {

        // clear existing visualizations
        clear();

        let reader = new FileReader();
        reader.onloadend = function () {
            console.log("data loaded: ");
            console.log(reader.result);

            // parse reader.result data and call the init functions with the parsed data!
            // Parse CSV data with d3.csvParse
            data = d3.csvParse(reader.result);
            console.log("Parsed data: ", data);

            initVis(data);

            CreateDataTable(data);
            // TODO: possible place to call the dashboard file for Part 2
            initDashboard(data);
        };
        reader.readAsBinaryString(fileInput.files[0]);
    };
    fileInput.addEventListener('change', readFile);
}

function initVis(data){

    // parse dimensions (i.e., attributes) from input file
    let dimensions = (data.columns).slice(1);
    //*HINT: the first dimension is often a label; It can simply remove the first dimension with
    // splice() Changes the Original data so slice is used instead
    // dimensions.splice(0, 1);
    // dimensions = dimensions.slice(1);

    // y scalings for scatterplot
    // TODO: set y domain for each dimension
    y = d3.scaleLinear()
        .domain([d3.min(data, d => d[dimensions[0]]), d3.max(data, d => d[dimensions[0]])])
        .range([height - margin.bottom - margin.top, margin.top]);

    // x scalings for scatter plot
    // TODO: set x domain for each dimension
    x = d3.scaleLinear()
        .domain([d3.min(data, d => d[dimensions[0]]), d3.max(data, d => d[dimensions[0]])])
        .range([margin.left, width - margin.left - margin.right]);

    console.log("Dimensions loaded: ", channels[1]);
    console.log( [Math.floor(d3.min(data, d => +d[dimensions[1]]) / 10) * 10, Math.ceil(d3.max(data, d => +d[dimensions[1]]) / 10) * 10]);

    // radius scalings for radar chart
    // TODO: set radius domain for each dimension
    r = d3.scaleLinear()
        .domain([d3.min(data, d => d[dimensions[0]]), d3.max(data, d => d[dimensions[0]])])
        .range([0, radius]);

    // scatterplot axes
    yAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft(y));

    yAxisLabel = yAxis.append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text("y");

    xAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(x));

    xAxisLabel = xAxis.append("text")
        .style("text-anchor", "middle")
        .attr("x", width - margin.right)
        .text("x");

    // radar chart axes
    radarAxesAngle = Math.PI * 2 / dimensions.length;
    let axisRadius = d3.scaleLinear()
        .range([0, radius]);
    let maxAxisRadius = 0.75,
        textRadius = 0.8;
    gridRadius = 0.1;

    // radar axes
    radarAxes = radar.selectAll(".axis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "axis");

    radarAxes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i){ return radarX(axisRadius(maxAxisRadius), i); })
        .attr("y2", function(d, i){ return radarY(axisRadius(maxAxisRadius), i); })
        .attr("class", "line")
        .style("stroke", "black");

    // TODO: render grid lines in gray
    // Render horizontal grid lines
    scatter.selectAll(".horizontal-grid")
        .data(y.ticks())
        .enter()
        .append("line")
        .attr("class", "horizontal-grid")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right-40)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#d3d3d3") // Light gray color
        .attr("stroke-width", "1px");

    // Render vertical grid lines
    scatter.selectAll(".vertical-grid")
        .data(x.ticks())
        .enter()
        .append("line")
        .attr("class", "vertical-grid")
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("stroke", "#d3d3d3") // Light gray color
        .attr("stroke-width", "1px");

    // TODO: render correct axes labels
    // Add x-axis label:
   yAxisLabel
        .text(dimensions[0]);

    //Add y-axis label:
    yAxisLabel
       .text(dimensions[0]);

    radar.selectAll(".axisLabel")
        .data(dimensions)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i){ return radarX(axisRadius(textRadius), i); })
        .attr("y", function(d, i){ return radarY(axisRadius(textRadius), i); })
        .text("dimension");

    // init menu for the visual channels
    channels.forEach(function(c){
        initMenu(c, dimensions);
    });

    // refresh all select menus
    channels.forEach(function(c){
        refreshMenu(c);
    });

    renderScatterplot();
    renderRadarChart();
}

// clear visualizations before loading a new file
function clear(){
    scatter.selectAll("*").remove();
    radar.selectAll("*").remove();
    dataTable.selectAll("*").remove();
}

//Create Table
function CreateDataTable(data) {

    // console.log("Print column of Table");
    // console.log(data.columns);

    // create table and add class
    // Select the table
    let table = d3.select("#dataTable").append("table")
              .classed("dataTableClass", true);

    // add headers, row & columns
    // Create the table header
    let thead = table.append("thead");
    let headers = data.columns;
    thead.append("tr")
        .selectAll("th")
        .data(headers)
        .enter()
        .append("th")
        .text(function(d) { return d; })
        .classed("tableHeaderClass", true);

    // Create the table body
    let tbody = table.append("tbody")

    // For each row in the data
    data.forEach(function(d) {
        // Append a row to the table body
        let row = tbody.append("tr");
        // For each column in the row
        headers.forEach(function(key) {
            // Append a cell to the row
            row.append("td")
                .text(d[key])
                .classed("tableBodyClass", true);
        });
    });


    // TODO: Table pagination, to allow manage long tables - Suggestion
    // TODO: Search and filter to filter columns - Suggestion

    // add mouseover event
    d3.selectAll("#dataTable tbody tr td")
        .on("mouseover", function() {
            // 'this' refers to the current table row being hovered
            d3.select(this).style("background-color", "lightblue");
        })
        .on("mouseout", function() {
            // Reset the background color when the mouse leaves the row
            d3.select(this).style("background-color", null);
        });

}
function renderScatterplot(){

    // TODO: get domain names from menu and label x- and y-axis
    // Get domain names from menu
    let xDomain = readMenu("scatterX");
    let yDomain = readMenu("scatterY");
    let rDomain = readMenu("size");

    // Label x- and y-axis
    xAxisLabel.text(xDomain);
    yAxisLabel.text(yDomain);

    console.log("Domain:")
    console.log(xDomain, yDomain, rDomain);


    // TODO: re-render axes
    // TODO: create a global variable - object dictionary to hold dimensions -> [domain] and do away with x, y and r
    // Re-render axes with new domains
    x.domain(d3.extent(data, d => +d[xDomain]));
    y.domain(d3.extent(data, d => +d[yDomain]));
    r.domain(d3.extent(data, d => +d[rDomain]));

    console.log("xDomain:", x, Math.floor(d3.min(data, d => +d[xDomain])/10)*10, Math.ceil(d3.max(data, d => +d[xDomain])/10)*10 );
    console.log("yDomain:", y, d3.extent(data, d => +d[yDomain]));

    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y));

    // TODO: render dots
    // Remove the old dots in the scatter plot before rendering new ones.
    scatter.selectAll(".dot")
        .remove();
    // Render dots
    let category = data.columns[0];
    let distinctCategories = new Set(data.map(d => d[category]));
    //define coloring for each of the distinct categories returned.
    //TODO Use a continuous coloring instead- can accommodated a wide range of categories
    let colorCategories = d3.schemeCategory10.slice(0, distinctCategories.size);
    let colorScale = d3.scaleOrdinal()
       .domain([distinctCategories])
       .range(colorCategories);

    scatter.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(+d[xDomain]))
        .attr("cy", d => y(+d[yDomain]))
        .attr("r", d => Math.abs(r(+d[rDomain]))/25)
        .style("fill", d => colorScale(d[category]));


    console.log("Category:")
    console.log(category, distinctCategories, colorCategories);

}

function renderRadarChart(){

    // TODO: show selected items in legend

    // TODO: render polylines in a unique color

}


function radarX(radius, index){
    return radius * Math.cos(radarAngle(index));
}

function radarY(radius, index){
    return radius * Math.sin(radarAngle(index));
}

function radarAngle(index){
    return radarAxesAngle * index - Math.PI / 2;
}

// init scatterplot select menu
function initMenu(id, entries) {
    $("select#" + id).empty();

    entries.forEach(function (d) {
        $("select#" + id).append("<option>" + d + "</option>");
    });

    $("#" + id).selectmenu({
        select: function () {
            renderScatterplot();
        }
    });
}

// refresh menu after reloading data
function refreshMenu(id){
    $( "#"+id ).selectmenu("refresh");
}

// read current scatterplot parameters
function readMenu(id){
    return $( "#" + id ).val();
}

// switches and displays the tabs
function openPage(pageName,elmnt,color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}
