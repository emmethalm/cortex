
"use client"
import { useState } from 'react';

// Step 1: Define the props interface
interface ChatbarProps {
  onMessageSubmit: (inputValue: string) => void;
}

// Step 2: Update the component to use the props interface
const Chatbar = ({ onMessageSubmit }: ChatbarProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim() !== '') {
      fetch('/api/createThread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // hard-code the current assitantId
        body: JSON.stringify({ userInput: inputValue, assistantId: 'asst_ekTzsOmyZKEkS2EeaKocfshs' }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Assistant Response:', data.assistantResponse);
        // Step 3: Call the onMessageSubmit prop function after the message is sent
        onMessageSubmit(inputValue);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
      console.log('Sending message to AI:', inputValue);
      setInputValue(''); 
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-neutral-700">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Ask a question..."
        className="flex-1 p-2 mr-2 text-sm border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white dark:border-transparent dark:placeholder-gray-400"
      />
      <button
        onClick={handleSend}
        className="p-2 text-sm text-white bg-blue-500 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
};

export default Chatbar;
