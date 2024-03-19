import { NavLink } from 'react-router-dom';
import './GroupsIndex.css';
import GroupItem from '../GroupItem';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroups, selectGroupsArr } from '../../store/groups';

function GroupsIndex() {
    const dispatch = useDispatch();
    const groups = useSelector(selectGroupsArr);

    useEffect(() => {
        dispatch(getAllGroups());
    }, [dispatch])

    return (
        <div className='wrapper'>
            <div className='body-container'>
                <div className='list-header'>
                    <NavLink to='/events'>Events</NavLink>
                    <NavLink to='/groups'>Groups</NavLink>
                    <h5>Groups in Venyou</h5>
                </div>
                {
                    groups.map(group => (
                        <GroupItem key={group.id} group={group}/>
                    ))
                }
            </div>
        </div>
    )
}

export default GroupsIndex;