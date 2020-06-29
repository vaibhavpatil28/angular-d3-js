import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TableStorageService } from '../table-storage.service';
import { getFormattedDate } from './formate-date';

export interface DeviceInfo {
  Device: string;
  Channel: string;
  Time: any;
  index?: number;
}
@Component({
  selector: 'app-device-info',
  templateUrl: './device-info.component.html',
  styleUrls: ['./device-info.component.scss']
})
export class DeviceInfoComponent implements OnInit, OnChanges {

  deviceInfoForm: FormGroup;
  @Input() data: DeviceInfo;
  tableIndex: number;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tableStorageService: TableStorageService,
    private activatedRoute: ActivatedRoute
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes: ', changes);
    if (changes.data.currentValue) {
      this.tableIndex = changes.data.currentValue.index
      this.deviceInfoForm.patchValue(changes.data.currentValue);
      if (changes.data.currentValue.hasOwnProperty('Device ')) {
        this.deviceInfoForm.get('Device').patchValue(changes.data.currentValue['Device ']);
      }
      this.deviceInfoForm.get('Time').patchValue(this.toDateString(new Date(changes.data.currentValue.Time)))
    }
  }
  private toDateString(date: Date): string {
    console.log('date.toTimeString(): ', date.toTimeString());
    return (date.getFullYear().toString() + '-'
      + ("0" + (date.getMonth() + 1)).slice(-2) + '-'
      + ("0" + (date.getDate())).slice(-2))
      + 'T' + date.toTimeString().slice(0, 8);
  }

  ngOnInit() {
    this.deviceInfoForm = this.fb.group({
      Device: [null, Validators.required],
      Channel: [null, Validators.required],
      Time: [null, Validators.required]
    });
    this.deviceInfoForm.get('Time').valueChanges.subscribe(val => {
      console.log('val: ', val);
      getFormattedDate(val)
    })
    console.log('deviceInfoForm: ', this.deviceInfoForm);
    // this.activatedRoute.paramMap.subscribe((params) => {
    //   console.log('paramMap: ', params.get('id'));
    //   if (params.has('id')) {
    //     this.tableId = parseInt(params.get('id'));
    //     console.log('tableId: ', this.tableId);
    //     const formData = this.tableStorageService.find(this.tableId);
    //     console.log('formData: ', formData);
    //   }
    // })
  }
  save() {
    this.deviceInfoForm.markAllAsTouched();
    console.log('this.deviceInfoForm: ', this.deviceInfoForm);
    if (this.deviceInfoForm.invalid) return;

    const deviceInfo: DeviceInfo = this.deviceInfoForm.getRawValue();
    deviceInfo.Time = getFormattedDate(deviceInfo.Time);

    if (this.checkUniqueRecord(deviceInfo)) {
      return;
    };

    if (this.tableIndex || this.tableIndex === 0) {
      this.tableStorageService.update(deviceInfo, this.tableIndex);
      // this.router.navigate(['table']);
      return;
    }
    this.tableStorageService.save(deviceInfo);
    // this.router.navigate(['table']);
  }
  private checkUniqueRecord(newDeviceInfo: DeviceInfo) {
    const deviceInfoList = this.tableStorageService.tableData.getValue();
    const device =  deviceInfoList.find((oldDeviceInfo, indx, arr) => {
      if (
        oldDeviceInfo.Device === newDeviceInfo.Device &&
        oldDeviceInfo.Time === newDeviceInfo.Time) {
        return true;
      }
    });
    console.log('device: ', device);
    if (device) {
      this.deviceInfoForm.setErrors({ uniqueValue: `Device id and Time at least one of them must have unique value` })
    } else {
      this.deviceInfoForm.setErrors(null);
    }
    return device;
  }

}
