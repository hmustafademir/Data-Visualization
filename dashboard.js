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

let chart1, chart2, chart3, chart4;
let gapminderInterval;

function initDashboard(_data) {
    const width = 600;
    const height = 400;

    // Clear old charts and intervals if any
    if (gapminderInterval) {
        gapminderInterval.stop();
    }
    d3.select("#chart1").selectAll("*").remove();
    d3.select("#chart2").selectAll("*").remove();
    d3.select("#chart3").selectAll("*").remove();
    d3.select("#chart4").selectAll("*").remove();

    chart1 = d3.select("#chart1").append("svg").attr("width", width).attr("height", height).append("g");
    chart2 = d3.select("#chart2").append("svg").attr("width", width).attr("height", height).append("g");
    chart3 = d3.select("#chart3").append("svg").attr("width", width).attr("height", height).append("g");
    chart4 = d3.select("#chart4").append("svg").attr("width", width).attr("height", height).append("g");

    createChart1(_data, width, height); // Gap Minder Clone
    createChart2(_data, width, height); // Bubble Chart
    createChart3(_data, width, height); // Bar Chart
    createChart4(_data, width, height); // Line/Scatter Chart
}

// Chart 1: Gap Minder Clone (uses its own dataset as it requires specific structure)
function createChart1(_data, width, height) {
    const margin = { left: 60, right: 20, top: 20, bottom: 60 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = chart1.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    let time = 0;
    const x = d3.scaleLog().base(10).range([0, w]).domain([142, 150000]);
    const y = d3.scaleLinear().range([h, 0]).domain([0, 90]);
    const area = d3.scaleLinear().range([25 * Math.PI, 1500 * Math.PI]).domain([2000, 1400000000]);
    const continentColor = d3.scaleOrdinal(d3.schemePastel1);

    const xLabel = g.append("text").attr("y", h + 40).attr("x", w / 2).attr("font-size", "14px").attr("text-anchor", "middle").text("GDP Per Capita ($)");
    const yLabel = g.append("text").attr("transform", "rotate(-90)").attr("y", -40).attr("x", -h / 2).attr("font-size", "14px").attr("text-anchor", "middle").text("Life Expectancy (Years)");
    const timeLabel = g.append("text").attr("y", h - 10).attr("x", w - 40).attr("font-size", "30px").attr("opacity", "0.4").attr("text-anchor", "middle").text("1800");

    g.append("g").attr("class", "x axis").attr("transform", "translate(0," + h + ")").call(d3.axisBottom(x).tickValues([400, 4000, 40000]).tickFormat(d3.format("$")));
    g.append("g").attr("class", "y axis").call(d3.axisLeft(y));

    d3.json('https://raw.githubusercontent.com/ioanmeri/resources/master/GapminderClone.json').then(function(data) {
        const formattedData = data.map(function(year) {
            return year["countries"].filter(function(country) {
                return (country.income && country.life_exp);
            }).map(function(country) {
                country.income = +country.income;
                country.life_exp = +country.life_exp;
                return country;
            })
        });

        function update(data) {
            const t = d3.transition().duration(100);
            const circles = g.selectAll("circle").data(data, d => d.country);

            circles.exit().remove();

            circles.enter().append("circle")
                .attr("fill", d => continentColor(d.continent))
                .merge(circles)
                .transition(t)
                .attr("cy", d => y(d.life_exp))
                .attr("cx", d => x(d.income))
                .attr("r", d => Math.sqrt(area(d.population) / Math.PI));

            timeLabel.text(+(time + 1800));
        }

        update(formattedData[0]);

        gapminderInterval = d3.interval(function() {
            time = (time < 214) ? time + 1 : 0;
            update(formattedData[time]);
        }, 100);
    });
}

// Chart 2: Generic Bubble Chart using uploaded data
function createChart2(_data, width, height) {
    if (!_data || _data.length === 0) return;
    
    const margin = { left: 50, right: 20, top: 20, bottom: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = chart2.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    const cols = Object.keys(_data[0]);
    if (cols.length < 2) return;

    // Use first two columns for X and Y, optionally third for size
    const xCol = cols[1];
    const yCol = cols.length > 2 ? cols[2] : cols[1];
    const sizeCol = cols.length > 3 ? cols[3] : null;

    const x = d3.scaleLinear().domain([0, d3.max(_data, d => +d[xCol]) || 10]).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(_data, d => +d[yCol]) || 10]).range([h, 0]);
    
    let r = d3.scaleLinear().range([5, 5]);
    if (sizeCol) {
        r.domain([0, d3.max(_data, d => +d[sizeCol]) || 10]).range([3, 15]);
    }

    g.append("g").attr("transform", "translate(0," + h + ")").call(d3.axisBottom(x));
    g.append("g").call(d3.axisLeft(y));
    
    g.append("text").attr("y", h + 30).attr("x", w / 2).attr("text-anchor", "middle").text(xCol);
    g.append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("x", -h / 2).attr("text-anchor", "middle").text(yCol);

    g.selectAll("circle").data(_data).enter().append("circle")
        .attr("cx", d => x(+d[xCol]) || 0)
        .attr("cy", d => y(+d[yCol]) || 0)
        .attr("r", d => sizeCol ? r(+d[sizeCol]) || 5 : 5)
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);
}

// Chart 3: Generic Bar Chart using uploaded data
function createChart3(_data, width, height) {
    if (!_data || _data.length === 0) return;
    
    const margin = { left: 50, right: 20, top: 20, bottom: 80 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = chart3.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    const cols = Object.keys(_data[0]);
    const labelCol = cols[0];
    const valCol = cols[1] || cols[0];

    const data = _data.slice(0, 15); // Limit to 15 items for readability

    const x = d3.scaleBand().range([0, w]).domain(data.map(d => d[labelCol])).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[valCol]) || 10]).range([h, 0]);

    g.append("g").attr("transform", "translate(0," + h + ")").call(d3.axisBottom(x))
     .selectAll("text").attr("transform", "translate(-10,0)rotate(-45)").style("text-anchor", "end");
    g.append("g").call(d3.axisLeft(y));

    g.append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("x", -h / 2).attr("text-anchor", "middle").text(valCol);

    g.selectAll("rect").data(data).enter().append("rect")
        .attr("x", d => x(d[labelCol]))
        .attr("y", d => y(+d[valCol]) || 0)
        .attr("width", x.bandwidth())
        .attr("height", d => h - (y(+d[valCol]) || 0))
        .attr("fill", "#69b3a2");
}

// Chart 4: Generic Line Chart using uploaded data
function createChart4(_data, width, height) {
    if (!_data || _data.length === 0) return;
    
    const margin = { left: 50, right: 20, top: 20, bottom: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = chart4.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    const cols = Object.keys(_data[0]);
    const xCol = cols[0];
    const yCol = cols.length > 1 ? cols[1] : cols[0];

    const data = _data.slice(0, 50);

    const x = d3.scalePoint().domain(data.map(d => d[xCol])).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d[yCol]) || 10]).range([h, 0]);

    g.append("g").attr("transform", "translate(0," + h + ")").call(d3.axisBottom(x).tickValues(x.domain().filter((d,i) => !(i%5))));
    g.append("g").call(d3.axisLeft(y));

    g.append("text").attr("y", h + 35).attr("x", w / 2).attr("text-anchor", "middle").text(xCol);
    g.append("text").attr("transform", "rotate(-90)").attr("y", -35).attr("x", -h / 2).attr("text-anchor", "middle").text(yCol);

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => x(d[xCol]))
            .y(d => y(+d[yCol]) || 0)
        );
}
