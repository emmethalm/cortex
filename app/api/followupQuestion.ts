import { defineEventHandler } from 'h3';
import { readBody } from 'h3';
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // expecting these inputs from the API call
  // should I rename these to fit the format: query, assistantIdForCurrentPdf, threadId
  const { userInput, assistantId, threadId } = body; // Align with the frontend keys
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Add a new message to the existing thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userInput
    });

     // Start a new run
     const run = await openai.beta.threads.runs.create(threadId, { 
        assistant_id: assistantId,
    });

    // Check the status of the current run
    let retrievedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (retrievedRun.status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for a second
      retrievedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Retrieve the latest messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantResponse = messages.data.find(message => message.role === 'assistant')?.content;

    return {
      threadId: threadId,
      userQuestion: userInput,
      assistantResponse: assistantResponse    
    };

  } catch (error) {
    console.error('Error with OpenAI:', error);
    return { error: 'Error occurred with OpenAI request.' };
  }
});