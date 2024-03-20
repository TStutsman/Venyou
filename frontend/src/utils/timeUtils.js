export const formatDate = (dateString) => {
    const unformattedDate = new Date(dateString);

    const [mm, dd, yyyy] = unformattedDate.toLocaleDateString('en-US').split('/').map(e => e.length < 2 ? '0' + e : e);
    const [timeNums, amPm] = unformattedDate.toLocaleTimeString('en-US').split(' ');

    const [hr, min] = timeNums.split(':');

    const date = yyyy + '-' + mm + '-' + dd;
    const time = hr + ':' + min + ' ' + amPm;
    
    return [
        date,
        time
    ]
}