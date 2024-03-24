import { csrfFetch } from './csrf';
import { createSelector } from 'reselect';

const headers = {
    'Content-Type': 'application/json'
}

const ADD_EVENTS = 'events/addEvents';
const REMOVE_EVENT = 'events/removeEvent';

const addEvents = events => ({
    type: ADD_EVENTS,
    events
});

const removeEvent = eventId => ({
    type: REMOVE_EVENT,
    eventId
});

export const getAllEvents = () => async dispatch => {
    try {
        const response = await csrfFetch('/api/events');
        const { Events: events } = await response.json();
        dispatch(addEvents(events));
        return events;
    } catch (e) {
        // return errors
        return e;
    }
}

export const getEventById = eventId => async dispatch => {
    try {
        const response = await csrfFetch(`/api/events/${eventId}`);
        const event = await response.json();
        dispatch(addEvents([event]));
        return event
    } catch (e) {
        return e;
    }
}

export const saveEvent = (groupId, event) => async dispatch => {
    try {
        const response = await csrfFetch(`/api/groups/${groupId}/events`, {
            method: 'POST',
            headers,
            body: JSON.stringify(event)
        });
        const newEvent = await response.json();
        dispatch(addEvents([newEvent]))
        return newEvent;
    } catch (e) {
        return e;
    }
}

export const saveEventImage = (eventId, image) => async () => {
    try {
        const response = await csrfFetch(`/api/events/${eventId}/images`, {
            method: 'POST',
            headers,
            body: JSON.stringify(image)
        });
        const newImage = await response.json();
        // Reload the whole group to get the updated list of images
        // dispatch(getGroupById(groupId));
        return newImage;
    } catch (e) {
        return e;
    }
}

export const deleteEvent = eventId => async dispatch => {
    try {
        const response = await csrfFetch(`/api/events/${eventId}`, {
            method: 'DELETE'
        });
        dispatch(removeEvent(+eventId));
        return response;
    } catch (e) {
        return e;
    }
}

export const selectEvents = state => state.events;

function sortDates(date1, date2) {
    const a = new Date(date1).getTime();
    const b = new Date(date2).getTime();
    const now = Date.now();

    // if a is past and b is upcoming, put b first
    if(a < now && b > now) return 1;
    // vice versa above case
    if(a > now && b < now) return -1;
    // if both are past events sort backwards chronologically
    if(a < now) return b - a;
    // if both are upcoming events sort chronologically
    return a - b;
}

export const selectEventsArr = createSelector(selectEvents, events => {
    return Object.values(events).sort((a,b) => sortDates(a.startDate, b.startDate));
});

const initialState = {};

function eventsReducer(state = initialState, action) {
    switch(action.type) {
        case ADD_EVENTS: {
            const newState = {...state};
            action.events.forEach(event => newState[event.id] = event);
            return newState;
        }
        case REMOVE_EVENT: {
            if(state[action.eventId] === undefined) return state;
            const newState = {...state};
            delete newState[action.eventId];
            return newState;
        }
        default:
            return state;
    }
}

export default eventsReducer;