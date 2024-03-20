import { useEffect, useState } from "react";
import { useRef } from "react";
import './DynamicImage.css';

function DynamicImage({ url, type }) {
    const [ showImage, setShowImage ] = useState(true);
    const imgRef = useRef(null);

    useEffect(() => {
        if(imgRef === null) return;
        if(url === null) return setShowImage(false);

        const isImage = () => new Promise((resolve) => {
            imgRef.current.onload = () => resolve(true);
            imgRef.current.onerror = () => resolve(false);
        });
        isImage().then(val => setShowImage(val));
    }, [imgRef, url])

    return (
        <div className={`${type}-image${showImage ? ' hide-overflow' : ''}`}>
            { showImage
                ? <img src={ url } alt='Image' ref={imgRef} />
                : <div className="no-image">
                    <h2>Image couldn&apos;t be loaded</h2>
                </div>
            }
        </div>
    )
}

export default DynamicImage;