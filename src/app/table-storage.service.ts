import { Injectable } from '@angular/core';
import { DeviceInfo } from './device-info/device-info.component';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TableStorageService {
  tableData = new BehaviorSubject<DeviceInfo[]>([]);   
  originalData = new BehaviorSubject<DeviceInfo[]>([]);
  private columnFilterMap = new Map();
  constructor() { 
  }
  setItem(tableData){
    sessionStorage.setItem('table', JSON.stringify(tableData));
  }
  getItem(){
    const data = JSON.parse(sessionStorage.getItem('table'));
    return data;
  }
  save(data: DeviceInfo){
    const tableData = this.tableData.getValue();
    tableData.push(data)
    this.setItem(tableData);
    this.originalData.next(tableData);
    this.tableData.next(tableData);
  }
  updateDeviceInfoList(data: DeviceInfo[]){
    const tableData = this.tableData.getValue();
    this.originalData.next([...tableData, ...data]);
    this.tableData.next([...tableData, ...data]);
  }
  update(data: DeviceInfo, index:number){
    const tableData = this.tableData.getValue();
    tableData.splice(index, 1, data);
    console.log('tableData: ', tableData);
    this.originalData.next(tableData);
    this.tableData.next(tableData);
  }
  delete(index:number){
    const tableData = this.tableData.getValue();
    tableData.splice(index, 1);
    this.originalData.next(tableData);
    this.tableData.next(tableData);
  }
  findByIndex(index:number){
    const tableData = this.originalData.getValue();
    console.log('tableData service: ', tableData);
    return {...tableData[index]} as DeviceInfo;
  }
  filter(searchValue:string, key:string){
    const deviceInfoList = this.tableData.getValue();
    const filteredList = deviceInfoList.filter((val, indx,arr)=>{
      if (
        (
          searchValue 
          && (
            typeof val[key] === 'string' && val[key].toLowerCase().includes(searchValue.toLowerCase())
            || `${val[key]}`.toLowerCase().includes(searchValue.toLowerCase())
          ))
        ) {
        return true;
      }
    });
    this.tableData.next(filteredList);
  }
  public searchIntoRow(searchText: string, searchColumn: string) {
    // console.log(' this.dataTableCopy', this.dataTableCopy);
    // console.log('searchText, searchColumn', searchText, searchColumn, event, event.target['value']);
    const deviceInfoList = this.originalData.getValue();
    let filteredList;
    this.columnFilterMap.set(searchColumn, searchText);

    if (!searchText && `${searchText}` !== '0') {
      this.columnFilterMap.delete(searchColumn);
    }
    if (this.columnFilterMap.size === 0) {
      this.tableData.next(deviceInfoList);
      return;
    }
    filteredList = deviceInfoList.filter((category) => {
      // console.log('category', category);
      let validFilterCount: number = 0;
      for (const key in category) {
        let searchResult: boolean;
        // if (category.hasOwnProperty(key) && key !== searchColumn) {
        //   return;
        // }
        // console.log('key', key);

        if (category.hasOwnProperty(key) && typeof category[key] === 'string') {
          if (this.columnFilterMap.has(key)) {
            searchResult = `${category[key]}`.toLowerCase().includes(this.columnFilterMap.get(key).toLowerCase());
            // console.log('searchResult', searchResult);
          }
          if (searchResult) {
            validFilterCount++;
          }
        } else {
          // console.log('else');
          if (typeof category[key] === 'number') {
            if (this.columnFilterMap.has(key)) {
              searchResult = category[key].toString().toLowerCase().includes(this.columnFilterMap.get(key).toLowerCase());
            }
            if (searchResult) {
              validFilterCount++;
            }
          }
        }
      }
      return validFilterCount === this.columnFilterMap.size;
    });
    this.tableData.next(filteredList);
  }
}
