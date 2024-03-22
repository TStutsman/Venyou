import { useDispatch } from "react-redux";
import { useModal } from '../../context/Modal';
import { deleteEvent } from "../../store/events";
import './DeleteEventModal.css';
import { useNavigate } from "react-router-dom";

function DeleteEventModal({ eventId, groupId }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const submitDelete = async () => {
        const response = await dispatch(deleteEvent(eventId));

        if(!response.ok) {
            console.log("Error deleting event:", response);
            return;
        }

        console.log('Successfully deleted');

        navigate(`/groups/${groupId}`);

        closeModal();
    }

    return (
        <div className="delete-event-modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to remove this event?</p>
            <button onClick={submitDelete}>Yes (Delete event)</button>
            <button onClick={closeModal}>No (Keep event)</button>
        </div>
    )
}

export default DeleteEventModal;