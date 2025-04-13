import { useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';

export default function Homepage(props) {

    /* eslint-disable-next-line no-unused-vars */
    const [data, setData] = useState(props ? props : null);

    useEffect(() => {
        
    }, []);

    

    return (
        <div className='homepage-container'>
            Homepage
        </div>
    );
}

Homepage.propTypes = {
    props: PropTypes.any
};
