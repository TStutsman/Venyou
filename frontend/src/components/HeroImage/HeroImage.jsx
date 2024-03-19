import { useEffect, useState } from "react";
import { useRef } from "react";
import './HeroImage.css';

function HeroImage({ url }) {
    const [ showImage, setShowImage ] = useState(true);
    const imgRef = useRef(null);

    useEffect(() => {
        if(imgRef === null) return;

        const isImage = () => new Promise((resolve) => {
            imgRef.current.onload = () => resolve(true);
            imgRef.current.onerror = () => resolve(false);
        });
        isImage().then(val => setShowImage(val));
    }, [imgRef])

    return (
        <div className='hero-image'>
            { showImage
                ? <img src={ url } alt='Image' ref={imgRef} />
                : <div className="no-image">
                    <h2>Image couldn&apos;t be loaded</h2>
                </div>
            }
        </div>
    )
}

export default HeroImage;