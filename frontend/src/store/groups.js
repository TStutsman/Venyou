import { csrfFetch } from './csrf';
import { createSelector } from 'reselect';

const ADD_GROUPS = 'groups/addGroups';
const ADD_EVENTS_TO_GROUP = 'groups/addEventsToGroup';

const addGroups = groups => ({
    type: ADD_GROUPS,
    groups
});

const addEventsToGroup = (groupId, events) => ({
    type: ADD_EVENTS_TO_GROUP,
    groupId,
    events
});

export const getAllGroups = () => async dispatch => {
    const response = await csrfFetch('/api/groups');

    if(response.ok) {
        const groups = await response.json();
        dispatch(addGroups(groups));
    } else {
        // return errors
        return await response.json();
    }
}

export const getGroupById = groupId => async dispatch => {
    try {
        const response = await csrfFetch(`/api/groups/${groupId}`);
        const group = await response.json();
        dispatch(addGroups([group]));
        return group;
    } catch (e) {
        return e;
    }
}

export const getEventsForGroupById = groupId => async dispatch => {
    try {
        const response = await csrfFetch(`/api/groups/${groupId}/events`);
        const { Events:events } = await response.json();
        dispatch(addEventsToGroup(+groupId, events));
        return events;
    } catch (e) {
        return e;
    }
}

export const selectGroups = state => state.groups;

export const selectGroupsArr = createSelector(selectGroups, groups => {
    return Object.values(groups);
})

const initialState = {};

function groupsReducer(state = initialState, action) {
    switch(action.type) {
        case ADD_GROUPS: {
            const newState = {...state};
            action.groups.forEach(group =>  newState[group.id] = group);
            return newState;
        }
        case ADD_EVENTS_TO_GROUP: {
            if(state[action.groupId] === undefined) return state;
            const newState = {...state};
            newState[action.groupId].Events = action.events;
            return newState;
        }
        default:
            return state;
    }
}

export default groupsReducer;