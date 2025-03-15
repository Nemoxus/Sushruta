import React from 'react';
import styled from 'styled-components';

const MenuButton = () => {
  return (
    <StyledMenu>
      <div className="bar"></div>
      <div className="bar"></div>
    </StyledMenu>
  );
}

const StyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  position: absolute;
  left: 20px; /* Aligns to the left side */
  top: 50%;
  transform: translateY(-50%);
  
  .bar {
    width: 20px; /* Small horizontal lines */
    height: 2px;
    background-color: white; /* White color */
    border-radius: 2px;
    transition: 0.3s;
  }

  &:hover .bar {
    background-color: #ddd; /* Lighten on hover */
  }
`;

export default MenuButton;
