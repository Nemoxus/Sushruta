import React, { useState } from 'react';

function PlaceHolder() {
    const [count, setCount] = useState(0); // Initialize count state

    return (
        <div className="card2"> 
            <button className='idle' onClick={() => setCount(count + 1)}>
                Count is {count}
            </button>          
        </div>
    );
}

export default PlaceHolder;