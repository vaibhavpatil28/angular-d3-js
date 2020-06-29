import { Injectable } from '@angular/core';
import { TableStorageService } from '../table-storage.service';
import { DeviceInfo } from '../device-info/device-info.component';
import { BehaviorSubject, merge } from 'rxjs';
import { mergeAll } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenerateChartDataService {

  private channelsWatched$ = new BehaviorSubject<{ name: string, count: number }[]>([]);
  deviceChannelsWatched$ = new BehaviorSubject(undefined);
  constructor(
    private tableStorageService: TableStorageService
  ) { }
  channelsWatched(filterDate: Date) {
    this.tableStorageService.originalData.subscribe(data => {
      const chartData = this.getChannelWatchDataForChart(filterDate, data)
      this.channelsWatched$.next(chartData);
    });
    return merge(this.channelsWatched$);
  }

  getChannelWatchDataForChart(filterDate: Date, data: DeviceInfo[]) {
    const filterData = this.filterByDate(data, filterDate)
    const chartData = [] as { name: string, count: number }[];
    console.log('filterData: ', filterData);

    return filterData.reduce((pv, cv, i, arr) => {
      if (cv.Channel.toLowerCase() === 'off' || cv.Channel.toLowerCase().trim() === 'on') {
        return pv;
      }
      const pRecord = pv.find(val => {
        console.log('cv.Channel.toLowerCase(): ', cv.Channel.toLowerCase());
        if (val.name === cv.Channel) {
          return true;
        }
      });
      if (pRecord) {
        pRecord.count++;
      } else {
        pv.push({ name: cv.Channel, count: 1 });
      }
      return pv;
    }, chartData);
  }

  private filterByDate(data: DeviceInfo[], filterDate: Date) {
    return data.filter(d => {
      const date = new Date(d.Time);
      if (
        date.getUTCDate() === filterDate.getUTCDate()
        && date.getUTCDay() === filterDate.getUTCDay()
        && date.getUTCFullYear() === filterDate.getUTCFullYear()
      ) {
        return true;
      }
    });
  }

  deviceChannelWatched(filterDate?: Date) {
    console.log('filterDate: ', filterDate);
    this.tableStorageService.originalData.subscribe(data => {
      console.log('data: ', data);
      if (data.length <= 0) {
        return;
      }
      const sortedDataByDate = filterDate && this.filterByDate(data, filterDate);
      const chartData = this.calcViewCountAndGroupByDevice(filterDate ? sortedDataByDate : data);
      console.log('chartData: ', chartData);
      this.deviceChannelsWatched$.next(chartData);
    });
    return merge(this.deviceChannelsWatched$);
  }
  private emitChannelWatched(filterDate: Date, data) {
    const chartData = this.getChannelWatchDataForChart(filterDate, data)
    this.channelsWatched$.next(chartData);
  }
  private emitDeviceChannelsWatched(filterDate: Date, data) {
    const sortedDataByDate = filterDate && this.filterByDate(data, filterDate);
    const chartData = this.calcViewCountAndGroupByDevice(filterDate ? sortedDataByDate : data);
    console.log('chartData: ', chartData);
    this.deviceChannelsWatched$.next(chartData);
  }
  private calcViewCountAndGroupByDevice(data: DeviceInfo[]) {
    console.log('calcViewCountAndGroupByDevice data: ', data);
    const chartMap = data.reduce((pv, cv, i, arr) => {
      if (cv.Channel.toLowerCase() === 'off' || cv.Channel.toLowerCase() === 'on') {
        return pv;
      }
      if ((pv.size <= 0) || !pv.has(cv.Device)) {
        pv.set(cv.Device, { 'category': cv.Device, [cv.Channel]: 1 });
        return pv;
      }
      if (pv.has(cv.Device) && !pv.get(cv.Device)[cv.Channel]) {
        let chartData = pv.get(cv.Device);
        chartData = { ...chartData, [cv.Channel]: 1 }
        pv.set(cv.Device, chartData);
        return pv;
      }
      if (pv.has(cv.Device) && pv.get(cv.Device)[cv.Channel]) {
        pv.get(cv.Device)[cv.Channel] += 1;
        return pv;
      }
      // for (const [key, value] of pv.entries()) {
      //   if (cv.Channel.toLowerCase() === 'off' || cv.Channel.toLowerCase() === 'on') {
      //     return pv;
      //   }
      //   if (key === cv.Device) {
      //     if (value[cv.Channel]) {
      //       value[cv.Channel]++;
      //       continue;
      //     }
      //     value[cv.Channel] = 1;
      //     continue;
      //   }
      //   pv.set(cv.Device, { [cv.Channel]: 1 });
      //   // pv.set(cv.Device, {'category': cv.Device});
      // }
      return pv;
    }, new Map<string, any>());

    // console.log('chartMap.values: ', chartMap.values());
    return Array.from(chartMap.values())
  }
  dateChanged(date: Date, chartType: string) {
    switch (chartType) {
      case 'groupBarChart':
        this.emitDeviceChannelsWatched(date, this.tableStorageService.originalData.getValue());
        break;
      case 'pieChart':
        this.emitChannelWatched(date, this.tableStorageService.originalData.getValue());
        break;
      default:
        break;
    }
  }
}
