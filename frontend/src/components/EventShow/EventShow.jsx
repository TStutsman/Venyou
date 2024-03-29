import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import DynamicImage from "../DynamicImage";
import { useDispatch, useSelector } from "react-redux";
import { getEventById, selectEvents } from '../../store/events';
import './EventShow.css';
import { useEffect, useState } from "react";
import { formatDate } from "../../utils/timeUtils";
import OpenModalButton from "../OpenModalButton";
import DeleteEventModal from "../DeleteEventModal";

function EventShow() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const event = useSelector(selectEvents)[eventId];
    const sessionUser = useSelector(state => state.session.user);

    const [showHostButtons, setShowHostButtons] = useState(false);

    useEffect(() => {
        window.scrollTo(0,0);
    }, []);

    useEffect(() => {
        dispatch(getEventById(eventId));
    }, [eventId, dispatch]);

    useEffect(() => {
        if(sessionUser && event && event.Group && event.Group.Organizer && sessionUser.id === event.Group.Organizer.id) setShowHostButtons(true);
    }, [sessionUser, event])

    if(!event || !event.id) return null;
    const { name, EventImages:images , description, type, price, startDate, endDate, Group:group } = event;
    const host = group?.Organizer;
    const groupImage = group?.GroupImages?.[0]?.url;
    const [ startDay, startTime ] = formatDate(startDate);
    const [ endDay, endTime ] = formatDate(endDate);
 
    return (
        <div className="event-show">
            <div className="event-header">
                <Breadcrumb to='/events'>Events</Breadcrumb>
                <h1>{ name }</h1>
                <h3>Hosted by {host?.firstName} {host?.lastName}</h3>
            </div>
            <div className="event-details-wrapper">
                <div className="event-details">
                    <DynamicImage url={ images?.[0]?.url } type='hero' />
                    <div className="details-cards">
                        <div className="group-info-card" onClick={() => navigate(`/groups/${group.id}`)}>
                            <DynamicImage url={ groupImage } type='icon'/>
                            <div className="top-info">
                                <h5>{ group?.name }</h5>
                                <p className="details">{ group?.private ? 'Private' : 'Public' }</p>
                            </div>
                        </div>
                        <div className="event-info-card">
                            <div className="time-details">
                                <div className="icon-wrapper">
                                    <i className="fa-2x fa-regular fa-clock"/>
                                </div>
                                <div className="event-times">
                                    <div className="event-time">
                                        <h6>START</h6>
                                        <p>{ startDay }</p>
                                        <p>&middot;</p>
                                        <p>{ startTime }</p>
                                    </div>
                                    <div className="event-time">
                                        <h6>END</h6>
                                        <p>{ endDay }</p>
                                        <p>&middot;</p>
                                        <p>{ endTime}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="cost-details">
                                <div className="icon-wrapper">
                                    <i className="fa-2x fa-solid fa-dollar-sign"/>
                                </div>
                                
                                <p>{ price !== undefined ? Number(price) === 0 ? 'FREE' : Number(price).toFixed(2) : '' }</p>
                            </div>
                            <div className="async-details">
                                <div className="icon-wrapper">
                                    <i className="fa-2x fa-solid fa-map-pin"/>
                                </div>
                                <p>{ type === 'In Person' ? 'In Person' : 'Online' }</p>
                            </div>
                            { showHostButtons &&
                                <div className="organizer-buttons">
                                    <button onClick={() => alert('Feature coming soon...')}>Update Event</button>
                                    <OpenModalButton
                                        buttonText="Delete Event"
                                        modalComponent={<DeleteEventModal eventId={eventId} groupId={group.id} />}
                                    />
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="event-description">
                    <h2>Details</h2>
                    <p>{ description }</p>
                </div>
            </div>
        </div>
    )
}

export default EventShow;