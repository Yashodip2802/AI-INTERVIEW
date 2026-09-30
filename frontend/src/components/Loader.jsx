import React from 'react';
import './Loader.scss';

const Loader = ({ message = "Loading..." }) => {
    return (
        <main className='loader-screen'>
            <div className='loader-container'>
                <div className='loader-spinner'></div>
                <h1 className='loader-message'>{message}</h1>
            </div>
        </main>
    );
};

export default Loader;