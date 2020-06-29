import { Component } from '@angular/core';
import { DeviceInfo } from './device-info/device-info.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
   editData:DeviceInfo;
}
