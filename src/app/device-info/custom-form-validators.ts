import { FormGroup } from '@angular/forms';
import { DeviceInfo } from './device-info.component';
import { BehaviorSubject } from 'rxjs';
import { getFormattedDate } from './formate-date';

// custom validator to check that two fields match
export function CompositeKey(tableData: BehaviorSubject<DeviceInfo[]>, ...controlsName: string[]) {
    return (formGroup: FormGroup) => {
        console.log('CompositeKey formGroup: ', formGroup);
        for (const iterator of controlsName) {
            const control = formGroup.controls[iterator];
            if (control.errors && !control.errors.uniqueValue) {
                // return if another validator has already found an error on the matchingControl
                return;
            }
        }
        console.log('----------------------------------------');
        const newDeviceInfo: DeviceInfo = formGroup.getRawValue();
        console.log('newDeviceInfo: ', newDeviceInfo);
        newDeviceInfo.Time = getFormattedDate(newDeviceInfo.Time);
        const deviceInfoList = tableData.getValue();
        console.log('deviceInfoList: ', deviceInfoList);
        const isUnique = deviceInfoList.every((oldDeviceInfo, indx, arr) => {
            for (const key of controlsName) {
                if (oldDeviceInfo[key] === newDeviceInfo[key]) {
                    return false;
                }
            }
            // return true;
        });

        // set error on formGroup if validation fails
        console.log('isUnique: ', isUnique);
        if (!isUnique) {
            formGroup.setErrors({ uniqueValue: `${controlsName} at least one value must unique` })
        } else {
            formGroup.setErrors(null);
        }
    }
}
