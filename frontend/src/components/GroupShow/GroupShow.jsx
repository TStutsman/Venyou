import { useNavigate, useParams } from 'react-router-dom';
import './GroupShow.css';
import { useDispatch, useSelector } from 'react-redux';
import { getEventsForGroupById, getGroupById, selectGroups, deleteGroup } from '../../store/groups';
import { useEffect } from 'react';
import DynamicImage from '../DynamicImage';
import EventItem from '../EventItem';
import Breadcrumb from '../Breadcrumb';
import DeleteGroupModal from '../DeleteGroupModal';
import OpenModalButton from '../OpenModalButton'

function GroupShow() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { groupId }= useParams();
    const group = useSelector(selectGroups)[groupId];
    const sessionUser = useSelector(state => state.session.user);

    useEffect(() => {
        dispatch(getGroupById(groupId));
        dispatch(getEventsForGroupById(groupId));
    }, [dispatch, groupId]);

    if(!group) return null;
    const { GroupImages, name, city, state, Organizer:organizer , about, Events:events } = group;
    const url = GroupImages ? GroupImages[0]?.url : undefined;

    let upcomingEvents, pastEvents;
    let numEvents = '';
    if(events) {
        upcomingEvents = events.filter(event => new Date(event.startDate) > new Date(Date.now()));
        pastEvents = events.filter(event => new Date(event.startDate) < new Date(Date.now()));
        numEvents = events.length + ' event' + (events.length === 1 ? '' : 's');
    }

    const onClick = () => {
        alert('Feature coming soon');
    }

    const createEvent = (e) => {
        navigate(`/groups/${groupId}/events/new`);
    }

    const updateGroup = (e) => {
        navigate(`/groups/${groupId}/edit`);
    }

    return (
        <div className='group-show'>
            <div className='hero'>
                <div className='hero-left'>
                    <Breadcrumb to='/groups'>Groups</Breadcrumb>
                    <DynamicImage url={ url } type={'hero'}/>
                </div>
                <div className='hero-details'>
                    <div>
                        <h2>{name}</h2>
                        <p className='location'>{ city }, { state }</p>
                        <p className='details'>{ numEvents } &middot; { group.private ? 'Private' : 'Public' }</p>
                        <p className='details'>Organized by { organizer?.firstName } { organizer?.lastName }</p>
                    </div>
                    {
                        sessionUser?.id === organizer?.id 
                        ? <div className='organizer-buttons'>
                            <button className='create-event' onClick={createEvent}>Create Event</button>
                            <button className='update-group' onClick={updateGroup}>Update</button>
                            <OpenModalButton
                                buttonText="Delete Group"
                                modalComponent={<DeleteGroupModal groupId={groupId} />}
                            />
                          </div>
                        : <button onClick={onClick} className='hero-button'>Join this group</button>
                    }
                </div>
            </div>
            <div className='group-details-wrapper'>
                <div className='group-details'>
                    <h2>Organizer</h2>
                    <p className='organizer'>{ organizer?.firstName } { organizer?.lastName }</p>
                    <h2>What we&apos;re about</h2>
                    <p className='description'>{ about }</p>
                    {
                        (!events || !events.length) &&
                        <h2>No Upcoming Events</h2>
                    }
                    {
                        upcomingEvents && upcomingEvents.length > 0 &&
                        <>
                            <h2>Upcoming Events ({upcomingEvents.length})</h2>
                            {
                                upcomingEvents.map(event => (
                                    <div key={event.id} className='event-card'>
                                        <EventItem event={event}/>
                                    </div>
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
                                    <div key={event.id} className='event-card'>
                                        <EventItem event={event}/>
                                    </div>
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