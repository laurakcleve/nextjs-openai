import Head from 'next/head'
import { ChangeEvent, FormEvent, useState } from 'react'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai'

type messageWithID = {
  id: number
  message: ChatCompletionRequestMessage
}

const initialMessages: messageWithID[] = [
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

    const formattedChat = newChatFromUser.map((item) => item.message)

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedChat),
    })
    const data = await response.json()

    const newChatFromAssistant: messageWithID[] = [
      ...newChatFromUser,
      { id: data.created, message: data.choices[0].message },
    ]

    setChat(newChatFromAssistant)
  }

  return (
    <>
      <Head>
        <title>GPT 3.5 Chat</title>
        <meta name='description' content='GPT 3.5 Chat' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        {chat?.map(
          (response) =>
            response.message.role !== 'system' && (
              <p key={response.id}>
                <span>{response.message.role}</span>
                {response.message.content}
              </p>
            )
        )}

        <form onSubmit={handleSubmit}>
          <input type='text' value={userInput} onChange={handleChange} />
          <button type='submit'>Send</button>
        </form>
      </main>
    </>
  )
}
