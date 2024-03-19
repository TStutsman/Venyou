import { useParams } from "react-router-dom";

function EventShow() {
    const { eventId } = useParams();

    return (
        <div>Event {eventId}!</div>
    )
}

export default EventShow;