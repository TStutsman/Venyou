import { useDispatch } from "react-redux";
import { useModal } from '../../context/Modal';
import { deleteGroup } from "../../store/groups";
import './DeleteGroupModal.css';
import { useNavigate } from "react-router-dom";

function DeleteGroupModal({ groupId }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const submitDelete = async () => {
        const response = await dispatch(deleteGroup(groupId));

        if(!response.ok) {
            console.log("Error deleting group:", response);
            return;
        }

        console.log('Successfully deleted');

        navigate('/groups');

        closeModal();
    }

    return (
        <div className="delete-group-modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to remove this group?</p>
            <button onClick={submitDelete}>Yes (Delete Group)</button>
            <button onClick={closeModal}>No (Keep Group)</button>
        </div>
    )
}

export default DeleteGroupModal;