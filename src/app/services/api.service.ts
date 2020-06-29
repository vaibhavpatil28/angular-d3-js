import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  /**
   * getDeviceInfo
   */
  public getDeviceInfo() {
    // const url = 'assets/device-info.json';
    const url = 'https://barctest.free.beeceptor.com/my/api/data';
    return this.httpClient.get(url).pipe(
      map((res)=> {
       return res['Sheet1'].map(item=>{
         Object.keys(item).map(k => item[k.trim()] = item[k]);
         return item;
        });
      })
    )
  }
}
