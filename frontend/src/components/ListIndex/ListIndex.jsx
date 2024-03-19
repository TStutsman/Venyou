import { NavLink } from 'react-router-dom';
import './ListIndex.css';
import GroupItem from '../GroupItem';
import EventItem from '../EventItem';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroups, selectGroupsArr } from '../../store/groups';
import { getAllEvents, selectEventsArr } from '../../store/events';

function ListIndex({ type }) {
    const dispatch = useDispatch();
    const groupsIndex = type === 'group';
    const getAllItems = groupsIndex ? getAllGroups : getAllEvents;
    const items = useSelector(groupsIndex ? selectGroupsArr : selectEventsArr);

    useEffect(() => {
        dispatch(getAllItems());
    }, [dispatch, getAllItems])

    return (
        <div className='wrapper'>
            <div className='body-container'>
                <div className='list-header'>
                    <NavLink to='/events'>Events</NavLink>
                    <NavLink to='/groups'>Groups</NavLink>
                    <h5>{type === 'group' ? 'Groups' : 'Events'} in Venyou</h5>
                </div>
                {
                    groupsIndex ?
                    items.map(group => (
                        <GroupItem key={group.id} group={group}/>
                    )) :
                    items.map(event => (
                        <EventItem key={event.id} event={event} />
                    ))
                }
            </div>
        </div>
    )
}

export default ListIndex;