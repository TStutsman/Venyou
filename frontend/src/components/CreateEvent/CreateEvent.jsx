import { useNavigate, useParams } from 'react-router-dom';
import './CreateEvent.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupById, selectGroups } from '../../store/groups';
import { saveEvent, saveEventImage } from '../../store/events';

function CreateEvent() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [isPrivate, setIsPrivate] = useState("");
    const [price, setPrice] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const { groupId } = useParams();
    const group = useSelector(selectGroups)[groupId];

    useEffect(() => {
        window.scrollTo(0,0);
    }, []);

    useEffect(() => {
        dispatch(getGroupById(groupId));
    }, [groupId, dispatch]);

    useEffect(() => {

        if(!submitted) {
            if(description.length && description.length < 50) setErrors({description: "Description must be at least 50 characters"});
            else setErrors({});
            return;
        }

        const validationErrors = {};
        if(!name) validationErrors.name = "Name is required";
        if(!type) validationErrors.type = "Event type is required";
        if(!isPrivate) validationErrors.private = "Visibility is required";
        if(!price.toString()) validationErrors.price = "Price is required"
        if(!start) validationErrors.startDate = "Event start is required";
        if(!end) validationErrors.endDate = "Event end is required";
        
        if(!url) validationErrors.url = "Image URL is required";
        else if(!(url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg'))) {
            validationErrors.url = "Image URL must end in .png, .jpg, or .jpeg";
        }

        if(description.length < 30) validationErrors.description = "Description needs 30 or more characters";
        setErrors(validationErrors);
    }, [name, type, isPrivate, price, start, end, url, description, submitted])

    if(!group) return null;

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        if(Object.keys(errors).length > 1) return;

        const event = {
            name, 
            type, 
            private: isPrivate,
            price,
            startDate: start,
            endDate: end,
            url,
            description,
            capacity: 10,
            venueId: 2
        }
        console.log('Event', event);
        
        const image = {
            url,
            preview: true
        }


        const newEvent = await dispatch(saveEvent(groupId, event));

        if(!newEvent.id) {
            const { message, errors } = await newEvent.json();
            console.log('Error Response', message, errors);
            return;
        }

        console.log('New event', newEvent);

        const newImage = await dispatch(saveEventImage(newEvent.id, image));
        
        if(!newImage.id) {
            const { errors } = await newImage.json();
            console.log('Error Response', errors);
            return;
        }
        
        console.log('Event Image', newImage);

        navigate(`/events/${newEvent.id}`);
    }

    return (
        <div className="create-event-page">
            <h1>Create a new event for {group.name}</h1>
            <form onSubmit={onSubmit}>
                <div className="form-section">
                    <label>
                        What is the name of your event?
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Event Name"
                        />
                    </label>
                    {errors.name && <p className='error'>{errors.name}</p>}
                </div>

                <div className="form-section">
                    <label>
                        Is this an in person or online event?
                        <select  
                            name="type" 
                            value={type} 
                            onChange={e => setType(e.target.value)}
                        >
                            <option value="" disabled>( select one )</option>
                            <option value="In Person">In person</option>
                            <option value="Online">Online</option>
                        </select>
                    </label>
                    {errors.type && <p className='error'>{errors.type}</p>}

                    <label>
                        Is this event private or public?
                        <select 
                            name="isPrivate"
                            value={isPrivate}
                            onChange={e => setIsPrivate(e.target.value)}
                        >
                            <option value="" disabled>( select one )</option>
                            <option value="false">Public</option>
                            <option value="true">Private</option>
                        </select>
                    </label>
                    {errors.private && <p className='error'>{errors.private}</p>}

                    <label>
                        What is the price for your event?
                        <div id='price-input-container'>
                            <div id='price-input-dollar'>$</div>
                            <input 
                                id='event-price'
                                type="number"
                                min={0}
                                step={.01}
                                value={price}
                                onChange={e => setPrice(+e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </label>
                    {errors.price && <p className='error'>{errors.price}</p>}
                </div>

                <div className="form-section">
                    <label>
                        When does your event start?
                        <input 
                            type="datetime-local" 
                            value={start}
                            onChange={e => setStart(e.target.value)}
                            placeholder="MM/DD/YYYY HH:mm AM"
                        />
                    </label>
                    {errors.startDate && <p className='error'>{errors.startDate}</p>}

                    <label>
                        When does your event end?
                        <input 
                            type="datetime-local" 
                            value={end}
                            onChange={e => setEnd(e.target.value)}
                            placeholder="MM/DD/YYYY HH:mm PM"
                        />
                    </label>
                    {errors.endDate && <p className='error'>{errors.endDate}</p>}
                </div>

                <div className="form-section">
                    <label>
                        Please add in image url for your event below:
                        <input 
                            type="text" 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="Image URL"
                        />
                    </label>
                    {errors.url && <p className='error'>{errors.url}</p>}
                </div>

                <label>
                    Please describe your event:
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Please include at least 30 characters"
                    />
                </label>
                {errors.description && <p className='error'>{errors.description}</p>}
                <button type='submit'>Create Event</button>
            </form>
        </div>
    )
}

export default CreateEvent;