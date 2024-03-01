const { Event } = require('../db/models');

const organizerOrCohost = (queryResult, userId) => {
    const resultObj = queryResult.toJSON();

    let group;
    if(queryResult instanceof Event) group = resultObj.Group;
    else group = resultObj;
    
    const isCohost = group.Memberships.some(member => member.userId === userId && member.status === 'co-host');
    
    const isOrganizer = group.organizerId === userId;

    return isOrganizer || isCohost;
}

// const organizerOrCohostOrAttendee = (event, userId) => {
//     const eventObj = event.toJSON();

//     const isCohost = eventObj.Group.Memberships.some(member => member.userId === userId && member.status === 'co-host');

//     const isOrganizer = eventObj.Group.organizerId === userId;
    
//     return isOrganizer || isCohost;
// }

module.exports = { organizerOrCohost };