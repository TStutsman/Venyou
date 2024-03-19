import { useParams } from 'react-router-dom';
import './GroupShow.css';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupById, selectGroups } from '../../store/groups';
import { useEffect } from 'react';

function GroupShow() {
    const dispatch = useDispatch();
    const { groupId }= useParams();
    const group = useSelector(selectGroups)[groupId];

    useEffect(() => {
        dispatch(getGroupById(groupId));
    }, [dispatch]);

    if(!group) return null;
    const { GroupImages, name, city, state, Organizer, about } = group;
    const url = GroupImages ? GroupImages[0].url : undefined;

    return (
        <div className='group-show'>
            <div className='hero'>
                <img src={ url } alt="Image" />
                <div className='hero-details'>
                    <h2>{name}</h2>
                    <p className='location'>{ city }, { state }</p>
                    <p className='details'>## events &middot; { group.private ? 'Private' : 'Public' }</p>
                    <p className='details'>Organized by { Organizer?.firstName } { Organizer?.lastName }</p>
                    <button>Join this group</button>
                </div>
            </div>
            <div className='group-details-wrapper'>
                <div className='group-details'>
                    <h2>Organizer</h2>
                    <p className='organizer'>{ Organizer?.firstName } { Organizer?.lastName }</p>
                    <h2>What we&apos;re about</h2>
                    <p className='description'>{ about }</p>
                    <h2>Upcoming Events (#)</h2>
                    <div>Event Card</div>
                </div>
            </div>
        </div>
    );
}

export default GroupShow;