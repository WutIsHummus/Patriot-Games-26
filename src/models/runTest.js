import testPrompt from './testPrompt.txt?raw'
import { sendMessage } from './agent.js'

/**
 * Send the prompt from testPrompt.txt and log the reply.
 */
export async function runTest() {
  const prompt = testPrompt.trim()

  if (!prompt) {
    throw new Error('testPrompt.txt is empty. Add a prompt to test with.')
  }

  console.log('Prompt:', prompt)
  const reply = await sendMessage(prompt)
  console.log('Reply:', reply)
  return reply
}

export { testPrompt }
