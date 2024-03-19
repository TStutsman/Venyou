import { NavLink, useParams } from 'react-router-dom';
import './GroupShow.css';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupById, selectGroups } from '../../store/groups';
import { useEffect } from 'react';
import HeroImage from '../HeroImage/HeroImage';

function GroupShow() {
    const dispatch = useDispatch();
    const { groupId }= useParams();
    const group = useSelector(selectGroups)[groupId];

    useEffect(() => {
        dispatch(getGroupById(groupId));
    }, [dispatch, groupId]);

    if(!group) return null;
    const { GroupImages, name, city, state, Organizer, about } = group;
    const url = GroupImages ? GroupImages[0].url : undefined;

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
                    <HeroImage url={ url }/>
                </div>
                <div className='hero-details'>
                    <div>
                        <h2>{name}</h2>
                        <p className='location'>{ city }, { state }</p>
                        <p className='details'>## events &middot; { group.private ? 'Private' : 'Public' }</p>
                        <p className='details'>Organized by { Organizer?.firstName } { Organizer?.lastName }</p>
                    </div>
                    <button onClick={onClick} className='hero-button'>Join this group</button>
                </div>
            </div>
            <div className='group-details-wrapper'>
                <div className='group-details'>
                    <h2>Organizer</h2>
                    <p className='organizer'>{ Organizer?.firstName } { Organizer?.lastName }</p>
                    <h2>What we&apos;re about</h2>
                    <p className='description'>{ about }</p>
                    <h2>Upcoming Events (#)</h2>
                    <div> &lt;Event Card&gt; </div>
                    <h2>Past Events (#)</h2>
                    <div> &lt;Event Card&gt; </div>
                </div>
            </div>
        </div>
    );
}

export default GroupShow;