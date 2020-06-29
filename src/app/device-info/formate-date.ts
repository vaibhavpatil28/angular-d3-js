
export function getFormattedDate(data) {
    // 2019-04-24 18:19:38.4900000
    const todayTime = new Date(data);
    const month = todayTime.getMonth() + 1;
    const day = todayTime.getDate();
    const year = todayTime.getFullYear();
    const hh = todayTime.getHours();
    const mm = todayTime.getMinutes();
    const ss = todayTime.getSeconds();
    const ms = todayTime.getMilliseconds();
    const currentZone = (todayTime.getTimezoneOffset() / 60) * -1;
    const splitTimezone = currentZone.toString().split('.');
    const zone = `${currentZone > 0 ? '+' : '-'}${splitTimezone[0]}:${(60 * parseFloat(`0.${splitTimezone[1]}`))}`
    // console.log('zone: ', zone);

    // console.log('===>', `${ year }-${ month }-${ day } ${ hh }:${ mm }:${ ss }.${ ms }${zone}`)
    return `${year}-${month}-${day} ${hh}:${mm}:${ss}.${ms}${zone}`;
}