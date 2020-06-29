import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GenerateChartDataService } from '../services/generate-chart-data.service';
import { TableStorageService } from '../table-storage.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  pieChartGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  barChartGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  groupBar: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  currentDate;
  formatedDate: string;

  constructor(
    private generateChartDataService: GenerateChartDataService,
    private tableStorageService: TableStorageService
  ) { }

  ngOnInit(): void {
    this.currentDate = new Date();
    this.formatedDate = this.toDateString(new Date());
  }
  ngAfterViewInit() {
    this.subcribeToCreatePieChart()
    this.generateChartDataService.deviceChannelWatched().subscribe(res => {
      const dataList = res;
      console.log('dataList: ', dataList);
      if (dataList && dataList.length > 0) {
        if (this.groupBar) {
          this.updateGroupBarChart(dataList);
          return;
        }
        this.groupBarChart(dataList);
      }
      this.groupBar && this.groupBar.html('');
      console.log('deviceChannelWatched dataList: ', dataList);
    });
  }
  subcribeToCreatePieChart(){
    this.generateChartDataService.channelsWatched(this.currentDate).subscribe(res => {
      const dataList = res;
      console.log('dataList: ', dataList);
      if (dataList && dataList.length > 0) {
        if (this.pieChartGroup && this.barChartGroup) {
          this.updatePieChart(dataList);
          this.updateBarChart(dataList);
          return;
        }
        this.createPieChart(dataList);
        this.createBarChart(dataList);
        return
      }
      this.pieChartGroup && this.pieChartGroup.html('');
      this.barChartGroup && this.barChartGroup.html('');
    });
  }
  private toDateString(date: Date): string {
    console.log('date.toTimeString(): ', date.toTimeString());
    return (date.getFullYear().toString() + '-'
      + ("0" + (date.getMonth() + 1)).slice(-2) + '-'
      + ("0" + (date.getDate())).slice(-2))
      + 'T' + date.toTimeString().slice(0, 8);
  }
  channelsWatchedDateChange(event) {
    console.log('channelsWatchedDateChange event: ', event);
    const date = new Date(event.target.value);
    this.generateChartDataService.dateChanged(date, 'pieChart');
  }
  // barChartDateChange(event) {
  //   console.log('event: ', event);
  //   const date = new Date(event.target.value);
  //   let dataList;
  //   this.generateChartDataService.channelsWatched(date).subscribe(res => {
  //     dataList = res;
  //     this.updateBarChart(dataList);
  //   });
  //   console.log('dataList: ', dataList);
  // }

  createPieChart(data = [{ name: 'star', count: 10 }, { name: 'color', count: 20 }, { name: 'zee', count: 50 }]) {
    const svgWidth = 500, svgHeight = 300, radius = Math.min(svgWidth, svgHeight) / 2;
    const canvas = d3.select('#pieChart').append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)

    this.pieChartGroup = canvas.append('g')
      .attr('transform', `translate(${radius}, ${radius})`);

    this.printPieChart(this.pieChartGroup, data, radius);

  }
  updatePieChart(data) {
    console.log('data: ', data);
    const svgWidth = 500, svgHeight = 300, radius = Math.min(svgWidth, svgHeight) / 2;
    // this.pieChartGroup.selectAll('g')
    // .exit()
    // .remove()
    // .data(data)
    this.pieChartGroup.html('');
    this.printPieChart(this.pieChartGroup, data, radius);
  }
  private printPieChart(group, data, radius) {
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<any>().value((d: any) => {
      return d.count
    });

    const path = d3.arc<any>()
      .innerRadius(50)
      .outerRadius(radius);

    console.log(`this.pieChartGroup.selectAll('arc'): `, this.pieChartGroup.selectAll('arc'));
    const arc = this.pieChartGroup.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g');

    arc.append('path')
      .attr('d', path)
      .attr('fill', (d) => color(d.data.name));

    arc.append('text')
      .attr('transform', (d) => `translate(${path.centroid(d)})`)
      .attr('dy', '0.15em')
      .text(d => `${d.data.name}(${d.data.count})`);
  }
  createBarChart(data = [{ name: 'star', count: 10 }, { name: 'color', count: 20 }, { name: 'zee', count: 50 }]) {
    const svgWidth = 500, svgHeight = 300,
      svg = d3.select('#barChart').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight),
      margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
    this.barChartGroup = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.printBarChart(this.barChartGroup, data, width, height);
  }
  private printBarChart(group: d3.Selection<SVGGElement, unknown, HTMLElement, any>, data: { name: string, count: number }[], width: number, height: number) {
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    // const parseTime = d3.timeParse("%d-%b-%y");

    const x = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .rangeRound([height, 0]);

    x.domain(data.map(function (d) {
      return d.name;
    }));
    y.domain([0, d3.max(data, function (d) {
      return Number(d.count);
    })]);

    group.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))

    group.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("count");

    group.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.name);
      })
      .attr("y", function (d) {
        return y(Number(d.count));
      })
      .attr("width", x.bandwidth())
      .attr("height", function (d) {
        return height - y(Number(d.count));
      });
  }
  private updateBarChart(data) {
    const svg = d3.select('#barChart').select('svg'),
      margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    this.barChartGroup.html('');
    this.printBarChart(this.barChartGroup, data, width, height);
  }

  groupedBarChartDateChange(event) {
    console.log('event: ', event);
    const date = new Date(event.target.value);
    this.generateChartDataService.dateChanged(date, 'groupBarChart');
    // this.generateChartDataService.deviceChannelWatched(date).subscribe(res => {
    //   dataList = res;
    //   this.updateGroupBarChart(dataList);
    //   console.log('deviceChannelWatched dataList: ', dataList);
    // });
  }
  private groupBarChart(data?: any[]) {
    const svgWidth = 500, svgHeight = 300,
      svg = d3.select('#groupBarChart').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight),
      margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
    this.groupBar = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.printGroupBarChart(data, this.groupBar, width, height);
  }
  private updateGroupBarChart(data) {
    const
      svg = d3.select('#groupBarChart').select('svg'),
      margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    this.groupBar.html('');
    this.printGroupBarChart(data, this.groupBar, width, height);
  }
  private printGroupBarChart(data: any[], groupBar, width, height) {
    console.log('height: ', height);
    console.log('width: ', width);
    console.log('groupBar: ', groupBar);
    console.log('data: ', data);
    const x0 = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .padding(0.05);

    const y = d3.scaleLinear()
      .rangeRound([height, 0]);

    // const z = d3.scaleOrdinal<any>()
    //   .range(["#16A085", "#33435C"]);
    const z = d3.scaleOrdinal(d3.schemeCategory10);

    const keys = Object.keys(data[0]).slice(1);

    x0.domain(data.map(function (d) { return d.category; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key] as number; }); })]).nice();

    this.groupBar.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", function (d) { return "translate(" + x0(d.category) + ",0)"; })
      .selectAll("rect")
      .data(function (d) {
        return keys.map(function (key) {
          return { key: key, value: d[key] };
        });
      })
      .enter().append("rect")
      .attr("x", function (d) { return x1(d.key); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function (d) {
        console.log('d: ', d);
        console.log('height - y(d.value)', height - y(d.value));
        return height - y(d.value || 0);
      })
      .attr("fill", function (d) { return z(d.key); });

    groupBar.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

    groupBar.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) - 5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Views");

    const legend = this.groupBar.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function (d) { return d; });
  }
}
