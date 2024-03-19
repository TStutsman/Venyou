import { useNavigate } from "react-router-dom";
import DynamicImage from "../DynamicImage";
import './EventItem.css';

function EventItem({ event }) {
    const navigate = useNavigate();

    const onClick = eventId => {
        navigate(`/events/${eventId}`)
    }

    const startDate = new Date(event.startDate);
    const [mm, dd, yyyy] = startDate.toLocaleDateString('en-US').split('/').map(e => e.length < 2 ? '0' + e : e);
    const [time, ampm] = startDate.toLocaleTimeString('en-US').split(' ');
    const [hr, min, sec] = time.split(':');

    return (
        <div className="event-item" onClick={() => onClick(event.id)}>
            <div className="event-item-top">
                <DynamicImage url={event.previewImage} type={'item'}/>
                <div className="content">
                    <p className='date-time'>{ `${yyyy}-${mm}-${dd}` } &middot; { `${hr}:${min} ${ampm}` }</p>
                    <h3>{ event.name }</h3>
                    <p className='location'>{ event.Group.city }, { event.Group.state }</p>
                </div>
            </div>
            <p className='description'>{ event.description }</p>
        </div>
    );
}

export default EventItem;