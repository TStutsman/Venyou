import { useNavigate } from "react-router-dom";
import DynamicImage from "../DynamicImage";
import './EventItem.css';
import { formatDate } from "../../utils/timeUtils";

function EventItem({ event, onClick }) {
    const navigate = useNavigate();

    const handleClick = eventId => {
        navigate(`/events/${eventId}`)
    }

    const [ startDay, startTime ] = formatDate(event.startDate);

    return (
        <div className="event-item" onClick={() => handleClick(event.id)}>
            <div className="event-item-top">
                <DynamicImage url={event.previewImage} type={'item'}/>
                <div className="content">
                    <p className='date-time'>{ startDay } &middot; { startTime }</p>
                    <h3>{ event.name }</h3>
                    <p className='location'>{ event.type === 'Online' ?  'Online' : event.Group?.city + ', ' + event.Group?.state }</p>
                </div>
            </div>
            <p className='description'>{ event.description }</p>
        </div>
    );
}

export default EventItem;