import React from "react";
import { signInWithGoogle } from "./firebaseConfig";
import styled from "styled-components";

const StyledWrapper = styled.div`
  button {
    --primary-color: #000;
    --secondary-color: #fff;
    --hover-color: #4118B2;
    
    border: 1px solid var(--secondary-color);
    border-radius: 20px;
    color: var(--secondary-color);
    padding: 0.7em 1.4em;
    background: var(--primary-color);
    cursor: pointer;
    display: flex;
    transition: 0.2s background, 0.2s border-color;
    align-items: center;
    gap: 0.8em;
    font-weight: bold;
    font-size: 0.9em;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  button:hover {
    background-color: var(--hover-color);
    border-color: #000;
  }
`;

const SignInBtn = () => {
  return (
    <StyledWrapper>
      <button onClick={signInWithGoogle}>Sign In</button>
    </StyledWrapper>
  );
};

export default SignInBtn;
