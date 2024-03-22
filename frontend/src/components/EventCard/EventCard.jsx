import EventItem from "../EventItem";
import { useNavigate } from "react-router-dom";

function EventCard({ event }) {
    const navigate =  useNavigate();

    const onClick = (e) => {
        // only navigates if the EventItem (target) isn't navigating already
        if(e.target === e.currentTarget) navigate(`/events/${event.id}`);
    }

    return (
        <div className="event-card" onClick={onClick}>
            <EventItem event={event}/>
        </div>
    );
}

export default EventCard;