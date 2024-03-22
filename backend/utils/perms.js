const { Group, EventImage } = require('../db/models');

const findMember = (memberArray, key, value) => {
    return memberArray.find(member => member[key] === value);
}

const getRole = (queryResult, userId) => {
    const resultObj = queryResult.toJSON();

    let group;
    if(queryResult instanceof EventImage) group = resultObj.Event.Group;
    else if(!(queryResult instanceof Group)) group = resultObj.Group;
    else group = resultObj;
    
    const isOrganizer = group.organizerId === userId;
    if(isOrganizer) return 'organizer';

    let member;
    if(group.Users) {
        member = findMember(group.Users, 'id', userId);
        if(member) member = member.Membership
    }
    else if (group.Memberships) member = findMember(group.Memberships, 'userId', userId);
    
    if(member) return member.status;
    
    return 'stranger';
}

module.exports = { getRole };