"use client"

import { useState } from 'react';
import Chatbar from './components/Chatbar';

interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialQuestion, setIsInitialQuestion] = useState(true);

  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    setMessages(prevMessages => [...prevMessages, { text, sender }]);
  };

  const handleNewMessage = async (inputValue: string) => {
    const apiEndpoint = isInitialQuestion ? '/api/createThread' : '/api/followupQuestion';
    setIsInitialQuestion(false);
    addMessage(inputValue, 'user');
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: inputValue }),
      });
      const data = await response.json();
      addMessage(data.assistantResponse, 'assistant');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      <h1 className="text-center text-4xl font-bold my-10">Your Cortex</h1>
      <div className="space-y-4 p-4 flex-grow">
        {messages.map((message, index) => (
          <div key={index} className={`text-sm ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <Chatbar onMessageSubmit={handleNewMessage} />
    </main>
    );
  }
