import React, { useState } from 'react';
import './index.css';

const SpotifyPlst = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`spotify-playlist-container ${isHovered ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="spotify-playlist-content">
        <iframe 
          style={{ borderRadius: '12px' }} 
          src="https://open.spotify.com/embed/playlist/6IkjEuzd0FrFxlK6aWDOtQ?utm_source=generator" 
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default SpotifyPlst;