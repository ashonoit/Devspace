/** Importing necessary libraries */
import axios from 'axios';   //for cross origin API call
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';   //for forwarding to another page


/** Constants */
const SLUG_WORKS = ["car", "dog", "computer", "person", "inside", "word", "for", "please", "to", "cool", "open", "source"];
const SERVICE_URL = "http://localhost:3000";

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
    <div className="min-h-screen flex items-center justify-center m-0 bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-900 dark:text-white">
          Code-Space
        </h1>

        <input
          onChange={(e) => setspaceId(e.target.value)}
          type="text"
          placeholder="Space ID"
          value={spaceId}
          className="block w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          name="language"
          id="language"
          onChange={(e) => setLanguage(e.target.value)}
          className="block w-full mb-6 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="nodejs">nodejs</option>
          <option value="python">c++</option>
        </select>

        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await axios.post(`${SERVICE_URL}/newSpace`, { spaceId, language });
            setLoading(false);
            navigate(`/coding/?spaceId=${spaceId}`);
          }}
          className={`w-full px-4 py-2 rounded-md text-black dark:text-white font-semibold transition ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? "Starting..." : "Start Coding"}
        </button>
      </div>
    </div>
  );
};

