import React from "react";
import styled from "styled-components";

const MenuButton = ({ isOpen, toggleMenu }) => {
  return (
    <StyledMenu onClick={toggleMenu} className={isOpen ? "open" : ""}>
      <div className="bar"></div>
      <div className="bar"></div>
    </StyledMenu>
  );
};

const StyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 20px;
  justify-content: center;

  .bar {
    width: 24px;
    height: 3px;
    background-color: white;
    border-radius: 2px;
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }

  &.open {
    .bar:first-child {
      transform: translateY(5px) rotate(43deg);
    }

    .bar:last-child {
      transform: translateY(-4px) rotate(-43deg);
    }
  }
`;

export default MenuButton;
