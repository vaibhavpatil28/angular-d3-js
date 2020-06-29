import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TableStorageService } from '../table-storage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceInfo } from '../device-info/device-info.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  tableDate;
  @Output() edit = new EventEmitter<DeviceInfo>();
  constructor(
    private tableStorageService: TableStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService:ApiService
  ) { }

  ngOnInit() {
    this.getDiviceInfo()
    this.tableDate = this.tableStorageService.tableData;
  }
  filter(searchValue: string, key:string){
    this.tableStorageService.searchIntoRow(searchValue, key);
  }
  private getDiviceInfo() {
    this.apiService.getDeviceInfo().subscribe(res=>{
      if (res) {
        this.tableStorageService.updateDeviceInfoList(res);
      }
    })
  }
  editClick(index:number, editData: DeviceInfo){
    editData.index = index;
    this.edit.emit(editData);
  }
  delete(index:number){
    this.tableStorageService.delete(index);
  }

}
