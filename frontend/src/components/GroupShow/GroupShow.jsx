import { NavLink, useParams } from 'react-router-dom';
import './GroupShow.css';
import { useDispatch, useSelector } from 'react-redux';
import { getEventsForGroupById, getGroupById, selectGroups } from '../../store/groups';
import { useEffect } from 'react';
import DynamicImage from '../DynamicImage';
import EventItem from '../EventItem';

function GroupShow() {
    const dispatch = useDispatch();
    const { groupId }= useParams();
    const group = useSelector(selectGroups)[groupId];

    useEffect(() => {
        dispatch(getGroupById(groupId));
        dispatch(getEventsForGroupById(groupId));
    }, [dispatch, groupId]);

    if(!group) return null;
    const { GroupImages, name, city, state, Organizer:organizer , about, Events:events } = group;
    const url = GroupImages ? GroupImages[0].url : undefined;

    let upcomingEvents, pastEvents;
    if(events) {
        upcomingEvents = events.filter(event => new Date(event.startDate) > new Date(Date.now()));
        pastEvents = events.filter(event => new Date(event.startDate) < new Date(Date.now()));
    }

    const onClick = () => {
        alert('Feature coming soon');
    }

    return (
        <div className='group-show'>
            <div className='hero'>
                <div className='hero-left'>
                    <div className='breadcrumb'>
                        <i className='fa fa-xs fa-angle-left' />
                        <NavLink to='/groups'>Groups</NavLink>
                    </div>
                    <DynamicImage url={ url } type={'hero'}/>
                </div>
                <div className='hero-details'>
                    <div>
                        <h2>{name}</h2>
                        <p className='location'>{ city }, { state }</p>
                        <p className='details'>## events &middot; { group.private ? 'Private' : 'Public' }</p>
                        <p className='details'>Organized by { organizer?.firstName } { organizer?.lastName }</p>
                    </div>
                    <button onClick={onClick} className='hero-button'>Join this group</button>
                </div>
            </div>
            <div className='group-details-wrapper'>
                <div className='group-details'>
                    <h2>Organizer</h2>
                    <p className='organizer'>{ organizer?.firstName } { organizer?.lastName }</p>
                    <h2>What we&apos;re about</h2>
                    <p className='description'>{ about }</p>
                    {
                        upcomingEvents && upcomingEvents.length > 0 &&
                        <>
                            <h2>Upcoming Events ({upcomingEvents.length})</h2>
                            {
                                upcomingEvents.map(event => (
                                    <div> &lt;Event Card&gt; </div>
                                ))
                            }
                        </>
                    }
                    {
                        pastEvents && pastEvents.length > 0 &&
                        <>
                            <h2>Past Events ({pastEvents.length})</h2>
                            {
                                pastEvents.map(event => (
                                    <EventItem event={event}/>
                                ))
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    );
}

export default GroupShow;