import { NavLink } from 'react-router-dom';
import './Breadcrumb.css';

function Breadcrumb({ to, children }) {

    return (
        <div className='breadcrumb'>
            <i className='fa fa-xs fa-angle-left' />
            <NavLink to={ to }>{ children }</NavLink>
        </div>
    )
}

export default Breadcrumb;