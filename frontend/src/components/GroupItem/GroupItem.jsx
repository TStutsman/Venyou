import { useNavigate } from 'react-router-dom';
import './groupItem.css';
import DynamicImage from '../DynamicImage';

function GroupItem({ group }) {
    const navigate = useNavigate();

    const onClick = groupId => {
        navigate(`/groups/${groupId}`)
    }

    return (
        <div className="group-item" onClick={() => onClick(group.id)}>
            <DynamicImage url={group.previewImage} type={'item'} />
            <div className="content">
                <h3>{ group.name }</h3>
                <p className='location'>{ group.city }, { group.state }</p>
                <p className='description'>{ group.about }</p>
                <p className='details'>## events &middot; { group.private ? 'Private' : 'Public' }</p>
            </div>
        </div>
    );
}

export default GroupItem;