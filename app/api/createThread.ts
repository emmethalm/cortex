import { defineEventHandler } from 'h3';
import { readBody } from 'h3';
import OpenAI from 'openai';

// Define the structure of the expected assistant response
interface AssistantResponse {
    role: string;
    type: string;
    content: any;
    text: {
      value: string;
      annotations?: Array<any>;
    };
}

interface ContentItem {
    type: string;
    text?: {
        value: string;
        annotations?: Array<any>;
    };
}


export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("Body from createThread:", body);
  
   // Extract user input and assistant ID from the request body
   const { userInput, assistantId: { assistantId } } = body;
  
   console.log("from createThread, assistantId:", assistantId);
 

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Create a new thread
    const thread = await openai.beta.threads.create();

    // Add message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userInput
    });

    // Start a new run
    const run = await openai.beta.threads.runs.create(thread.id, { 
      assistant_id: assistantId, // Your existing assistant ID
    });

    // Check run status and wait for the response
    let retrievedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (retrievedRun.status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second
      retrievedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Retrieve messages from the thread for the response
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log("All messages from the thread:", messages.data);

    // Bypass TypeScript's strict typing system
    const assistantMessages = messages.data as unknown as AssistantResponse[];
    console.log("Assistant messages:", assistantMessages);

    // Print out the 'content' array of each message
    assistantMessages.forEach((message, index) => {
    console.log(`Content of message ${index + 1}:`, message.content);
  });

     // Find the first assistant message
    const assistantMessage = assistantMessages.find(message => message.role === 'assistant');

    if (assistantMessage) {
    // Extract the 'value' from the first content item of type 'text'
    const textContent = assistantMessage.content.find((contentItem: ContentItem) => contentItem.type === 'text');
    const assistantTextResponse = textContent?.text?.value;

  return {
    threadId: thread.id,
    userQuestion: userInput,
    assistantResponse: assistantTextResponse 
  };
} else {
  console.error('No assistant message found.');
  return { error: 'No assistant message found.' };
}


  } catch (error) {
    console.error('Error with OpenAI:', error);
    return { error: 'Error occurred with OpenAI request.' };
  }
});
