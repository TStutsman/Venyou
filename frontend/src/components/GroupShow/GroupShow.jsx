import { useParams } from 'react-router-dom';
import './GroupShow.css';
import { useSelector } from 'react-redux';
import { selectGroups } from '../../store/groups';

function GroupShow() {
    const { groupId }= useParams();
    const group = useSelector(selectGroups)[groupId];
    
    return (
        <div>
            <div className='hero'>
                <img src={group.previewImg} alt="Image" />
                <div className='hero-details'>
                    <h2>{group.name}</h2>
                    <p className='location'></p>
                </div>
            </div>
        </div>
    );
}

export default GroupShow;