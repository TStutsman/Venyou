import { useEffect, useState } from "react";
import './DynamicImage.css';

function DynamicImage({ url, type }) {
    const [ showImage, setShowImage ] = useState(false);

    const onError = () => {
        setShowImage(false)
    }

    // need this useEffect to wait for the url to load before
    // attempting to load the image
    useEffect(() => {
        if(url) setShowImage(true);
    }, [url]);

    return (
        <div className={`${type}-image${showImage ? ' hide-overflow' : ''}`}>
            { showImage
                ? <img onError={ onError } src={ url } />
                : <div className="no-image">
                    <h2>Image couldn&apos;t be loaded</h2>
                  </div>
            }
        </div>
    )
}

export default DynamicImage;