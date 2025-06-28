/** Importing necessary libraries */
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

/** Constants */
const SLUG_WORKS = ["car", "dog", "computer", "person", "inside", "word", "for", "please", "to", "cool", "open", "source"];
const SERVICE_URL = "http://localhost:3000";

/** Styled components */
const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: white;
`;

const StyledInput = styled.input`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledSelect = styled.select`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

/** Helper function */
function getRandomSlug() {
    let slug = "";
    for (let i = 0; i < 3; i++) {
        slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
    }
    return slug;
}

export const Landing = () => {
    const [language, setLanguage] = useState("nodejs");
    const [spaceId, setspaceId] = useState(getRandomSlug());
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    return (
      <Container>
        <Title>Code-Space</Title>
        <StyledInput
          onChange={(e) => setspaceId(e.target.value)}
          type="text"
          placeholder="Space ID"
          value={spaceId}
        />
        <StyledSelect
          name="language"
          id="language"
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="nodejs">nodejs</option>
          <option value="python">c++</option>
        </StyledSelect>
        <StyledButton disabled={loading} onClick={async () => {
          setLoading(true);
          await axios.post(`${SERVICE_URL}/newSpace`, { spaceId, language });
          setLoading(false);
          navigate(`/coding/?spaceId=${spaceId}`)
        }}>{loading ? "Starting ..." : "Start Coding"}</StyledButton>
      </Container>
    );
}
