import { useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import DynamicImage from "../DynamicImage";
import { useDispatch, useSelector } from "react-redux";
import { getEventById, selectEvents } from '../../store/events';
import './EventShow.css';
import { useEffect } from "react";
import { formatDate } from "../../utils/timeUtils";

function EventShow() {
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const event = useSelector(selectEvents)[eventId];

    useEffect(() => {
        dispatch(getEventById(eventId));
    }, [eventId, dispatch])

    if(!event) return null;
    const { name, previewImage, description, type, price, startDate, endDate, Group:group, Venue:venue } = event;
    const [ startDay, startTime ] = formatDate(startDate);
    const [ endDay, endTime ] = formatDate(endDate);
 
    return (
        <div className="event-show">
            <div className="event-header">
                <Breadcrumb to='/events'>Events</Breadcrumb>
                <h1>{ name }</h1>
                <h3>Hosted by firstname lastname</h3>
            </div>
            <div className="event-details-wrapper">
                <div className="event-details">
                    <DynamicImage url={ previewImage } type='hero' />
                    <div className="details-cards">
                        <div className="group-info-card">
                            <DynamicImage url={ previewImage } type='icon'/>
                            <div className="top-info">
                                <h5>{ group.name }</h5>
                                <p className="details">{ group.private ? 'Private' : 'Public' }</p>
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
                                <p>{ price === 0 ? 'FREE' : price }</p>
                            </div>
                            <div className="async-details">
                                <div className="icon-wrapper">
                                    <i className="fa-2x fa-solid fa-map-pin"/>
                                </div>
                                <p>{ type === 'In Person' ? venue.address : 'Online' }</p>
                            </div>
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