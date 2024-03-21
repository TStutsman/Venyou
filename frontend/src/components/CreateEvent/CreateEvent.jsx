import { useParams } from 'react-router-dom';
import './CreateEvent.css';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGroupById, selectGroups } from '../../store/groups';

function CreateEvent() {
    const dispatch = useDispatch();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [isPrivate, setIsPrivate] = useState("");
    const [price, setPrice] = useState(0);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [url, setUrl] = useState("");
    const [about, setAbout] = useState("");

    const { groupId } = useParams();
    const group = useSelector(selectGroups)[groupId];

    useEffect(() => {
        dispatch(getGroupById(groupId));
    }, [groupId, dispatch]);

    if(!group) return null;

    const onSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <div className="create-event-page">
            <h1>Create an event for {group.name}</h1>
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
                </div>

                <div className="form-section">
                    <label>
                        When does your event start?
                        <input 
                            type="text" 
                            value={start}
                            onChange={e => setStart(e.target.value)}
                            placeholder="MM/DD/YYYY HH:mm AM"
                        />
                    </label>

                    <label>
                        When does your event end?
                        <input 
                            type="text" 
                            value={end}
                            onChange={e => setEnd(e.target.value)}
                            placeholder="MM/DD/YYYY HH:mm PM"
                        />
                    </label>
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
                </div>

                <label>
                    Please describe your event:
                    <textarea
                        value={about}
                        onChange={e => setAbout(e.target.value)}
                        placeholder="Please include at least 30 characters"
                    />
                </label>
                <button type='submit'>Create event</button>
            </form>
        </div>
    )
}

export default CreateEvent;