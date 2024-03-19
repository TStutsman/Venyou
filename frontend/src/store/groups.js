import { csrfFetch } from './csrf';
import { createSelector } from 'reselect';

const ADD_GROUPS = 'groups/addGroups';

const addGroups = groups => ({
    type: ADD_GROUPS,
    groups
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

export const selectGroups = state => state.groups;

export const selectGroupsArr = createSelector(selectGroups, groups => {
    return Object.values(groups);
})

const initialState = {};

function groupsReducer(state = initialState, action) {
    switch(action.type) {
        case ADD_GROUPS: {
            const newState = {...state}
            action.groups.forEach(group => newState[group.id] = group);
            return newState;
        }
        default:
            return state;
    }
}

export default groupsReducer;