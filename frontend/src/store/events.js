import { csrfFetch } from './csrf';
import { createSelector } from 'reselect';

const ADD_EVENTS = 'events/addEvents';

const addEvents = events => ({
    type: ADD_EVENTS,
    events
});

export const getAllEvents = () => async dispatch => {
    const response = await csrfFetch('/api/events');

    if(response.ok) {
        const { Events: events } = await response.json();
        dispatch(addEvents(events));
    } else {
        // return errors
        return await response.json();
    }
}

export const getEventById = eventId => async dispatch => {
    const response = await csrfFetch(`/api/events/${eventId}`);

    if(response.ok) {
        const event = await response.json();
        dispatch(addEvents([event]));
    } else {
        return await response.json();
    }
}

export const selectEvents = state => state.events;

export const selectEventsArr = createSelector(selectEvents, events => {
    return Object.values(events);
});

const initialState = {};

function eventsReducer(state = initialState, action) {
    switch(action.type) {
        case ADD_EVENTS: {
            const newState = {...state};
            action.events.forEach(event => newState[event.id] = event);
            return newState;
        }
        default:
            return state;
    }
}

export default eventsReducer;