import Head from 'next/head'
import { ChangeEvent, FormEvent, useRef, useState } from 'react'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai'
import Message from '../components/Message'
import MessageSource from '@/components/MessageSource'

export type CustomMessage = {
  id: number
  message: ChatCompletionRequestMessage
  source?: string
}

const initialMessages: CustomMessage[] = [
  {
    id: Date.now(),
    message: {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content:
        'You are a swashbuckling pirate and you talk only in pirate-speak.',
    },
  },
]

export default function Home() {
  const [chat, setChat] = useState(initialMessages)
  const [userInput, setUserInput] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setUserInput(event.target.value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setUserInput('')

    const newChatFromUser = [
      ...chat,
      {
        id: Date.now(),
        message: {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: userInput,
        },
      },
    ]

    setChat(newChatFromUser)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newChatFromUser, userInput }),
    })
    const data = await response.json()

    setChat(data)
  }

  return (
    <>
      <Head>
        <title>GPT 3.5 Chat</title>
        <meta name='description' content='GPT 3.5 Chat' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='min-h-screen bg-zinc-800 text-zinc-200'>
        <div className='max-w-2xl mx-auto px-5 pt-20 pb-40'>
          <div className='divide-y divide-zinc-700'>
            {chat?.map(
              (response) =>
                response.message.role !== 'system' && (
                  <div key={response.id} className='py-8'>
                    <Message
                      role={response.message.role}
                      content={response.message.content}
                    />
                    {response.source && (
                      <MessageSource slug={response.source} />
                    )}
                  </div>
                )
            )}
          </div>

          <form onSubmit={handleSubmit} className='mt-10 flex gap-3'>
            <input
              type='text'
              value={userInput}
              onChange={handleChange}
              className='px-4 py-1.5 flex-1 rounded-md bg-zinc-700 text-zinc-200'
            />
            <button
              type='submit'
              className='px-5 py-1 rounded-md bg-indigo-600'
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
