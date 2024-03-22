import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import './CreateGroup.css';
import { saveGroup, saveGroupImage } from '../../store/groups';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [ location, setLocation ] = useState("");
    const [ name, setName ] = useState("");
    const [ about, setAbout] = useState("");
    const [ type, setType ] = useState("");
    const [ isPrivate, setIsPrivate ] = useState("");
    const [ imageUrl, setImageUrl ] = useState("");
    const [ errors, setErrors ] = useState({});
    const [ submitted, setSubmitted ] = useState(false);

    useEffect(() => {
        window.scrollTo(0,0);
    }, []);

    useEffect(() => {

        if(!submitted) {
            if(about.length && about.length < 50) setErrors({about: "Description must be at least 50 characters"});
            else setErrors({});
            return;
        }

        const validationErrors = {};
        if(!location) validationErrors.location = "Location is required";
        if(!name) validationErrors.name = "Name is required";
        if(about.length < 50) validationErrors.about = "Description must be at least 50 characters";
        if(!type) validationErrors.type = "Group type is required";
        if(!isPrivate) validationErrors.private = "Group privacy is required"
        if(!imageUrl) validationErrors.imageUrl = "Group image is required"
        setErrors(validationErrors);
    }, [location, name, about, type, isPrivate, imageUrl, submitted])

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        if(Object.keys(errors).length > 1) return;

        const [city, state] = location.split(', ');

        const group = {
            name, about, type, private: isPrivate, city, state
        }
        // console.log('Group', group);
        
        const image = {
            url: imageUrl,
            preview: true
        }


        const newGroup = await dispatch(saveGroup(group));

        if(!newGroup.id) {
            const { errors } = await newGroup.json();
            console.log('Error Response', errors);
            return;
        }

        // console.log('New Group', newGroup);

        const newImage = await dispatch(saveGroupImage(newGroup.id, image));
        
        if(!newImage.id) {
            const { errors } = await newImage.json();
            console.log('Error Response', errors);
            return;
        }
        
        // console.log('Group Image', newImage);

        navigate(`/groups/${newGroup.id}`);
    }

    return (
        <div className='create-group-page'>
            <form onSubmit={onSubmit}>
                <div className='form-section'>
                    <h3>BECOME AN ORGANIZER</h3>
                    <h2>We&apos;ll walk you through a few steps to build your local community</h2>
                </div>
                <div className='form-section'>
                    <h2>First, set your group&apos;s location.</h2>
                    <p>Venyou groups meet locally, in person and online. We&apos;ll connect you with people in your area, and more can join you online.</p>
                    <input type="text" placeholder='City, STATE' value={location} onChange={(e) => setLocation(e.target.value)}/>
                    {errors.location && <p className='error'>{errors.location}</p>}
                </div>
                <div className='form-section'>
                    <h2>What will your group&apos;s name be?</h2>
                    <p>Choose a name that will give people a clear idea of what the group is about.<br/>Feel free to get creative! You can edit this later if you change your mind.</p>
                    <input type="text" placeholder='What is your group name?' value={name} onChange={(e) => setName(e.target.value)}/>
                    {errors.name && <p className='error'>{errors.name}</p>}
                </div>
                <div className='form-section'>
                    <h2>Now describe the purpose of your group.</h2>
                    <p>People will see this when we promote your group, but you&apos;ll be able to add to it later, too.</p>
                    <ol>
                        <li>What&apos;s the purpose of the group?</li>
                        <li>Who should join?</li>
                        <li>What will you do at your events?</li>
                    </ol>
                    <textarea placeholder='Please write at least 50 characters' value={about} onChange={(e) => setAbout(e.target.value)}/>
                    {errors.about && <p className='error'>{errors.about}</p>}
                </div>
                <div className='form-section final-steps'>
                    <h2>Final steps...</h2>

                    <div className='select-group'>
                        <p>Is this an in person or online group?</p>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="" disabled>(select one)</option>
                            <option value="In Person">In person</option>
                            <option value="Online">Online</option>
                        </select>
                        {errors.type && <p className='error'>{errors.type}</p>}
                    </div>

                    <div className='select-group'>
                        <p>Is this group private or public?</p>
                        <select value={isPrivate} onChange={(e) => setIsPrivate(e.target.value)}>
                            <option value="" disabled>(select one)</option>
                            <option value='true'>Private</option>
                            <option value='false'>Public</option>
                        </select>
                        {errors.private && <p className='error'>{errors.private}</p>}
                    </div>

                    <p>Please add an image url for your group below:</p>
                    <input type="text" placeholder='Image Url' value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}/>
                    {errors.imageUrl && <p className='error'>{errors.imageUrl}</p>}
                </div>
                <button disabled={!!Object.keys(errors).length}>Create group</button>
            </form>
        </div>
    )
}

export default CreateGroup;