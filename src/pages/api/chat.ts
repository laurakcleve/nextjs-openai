// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import path from 'path'
import { promises as fs } from 'fs'
import winston from 'winston'
import type { CustomMessage } from '..'

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const { combine, timestamp, json } = winston.format
const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [new winston.transports.File({ filename: 'main.log' })],
})

type IndexChunk = {
  content: string
  name: string
  vector: number[]
}

type Score = {
  score: number
  content: string
  name: string
}

const EMBEDDING_MODEL = 'text-embedding-ada-002'
const CHAT_MODEL = 'gpt-3.5-turbo'

const BASE_PROMPT =
  "You are a swashbuckling pirate, and a programmer who specializes in web development, and you only speak in pirate speak. You are the digital soul of Jimmy Cleveland, and you have a Youtube channel for which you are currently answering questions. All your answers should be in pirate speak, and try to format your answers in markdown. Give a succinct answer to the question using only the information in excerpt below, as if you have no prior knowledge about the question, and remember to speak like a pirate. Translate any text you use from the excerpt into pirate speak. If there is no information in the excerpt that is relevant to the question, respond with 'NOT FOUND', then apologize in pirate speak and say there isn't enough information in the blog to answer, in pirate speak."

const similarity = (v1: number[], v2: number[]) => {
  return v1.map((_, i) => v1[i] * v2[i]).reduce((a, b) => a + b)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomMessage[]>
) {
  logger.info({ 'req.body.userInput': req.body.userInput })

  const queryEmbedding = await openai.createEmbedding({
    input: req.body.userInput,
    model: EMBEDDING_MODEL,
  })
  logger.info({
    queryEmbedding: queryEmbedding.data.data[0],
    queryEmbeddingModel: EMBEDDING_MODEL,
  })

  const queryVector = queryEmbedding.data.data[0].embedding

  const jsonDirectory = path.join(process.cwd(), 'json')
  const fileContents = await fs.readFile(
    jsonDirectory + '/index-videos.json',
    'utf-8'
  )
  const index = JSON.parse(fileContents)

  const scores: Score[] = index.map((chunk: IndexChunk) => {
    return {
      score: similarity(queryVector, chunk.vector),
      content: chunk.content,
      name: chunk.name,
    }
  })
  scores.sort((a, b) => b.score - a.score)

  const systemMessage: CustomMessage = req.body.newChatFromUser.find(
    (msg: CustomMessage) =>
      msg.message.role === ChatCompletionRequestMessageRoleEnum.System
  )

  systemMessage.message.content =
    BASE_PROMPT + '\n\nEXCERPT:\n\n' + scores[0].content

  const formattedChat: ChatCompletionRequestMessage[] =
    req.body.newChatFromUser.map((item: CustomMessage) => item.message)

  const completion = await openai.createChatCompletion({
    model: CHAT_MODEL,
    messages: formattedChat,
    temperature: 0.0,
  })

  const assistantMessage = completion.data.choices[0].message
  const assistantMessageContent = assistantMessage?.content || ''

  logger.info({ response: assistantMessage, responseModel: CHAT_MODEL })

  const re = /\s*NOT FOUND[^\w]\s*/
  let sourceFound = !re.test(assistantMessageContent)
  let strippedMessage = assistantMessageContent.replace(re, '')

  const newChatFromAssistant: CustomMessage[] = [
    ...req.body.newChatFromUser,
    {
      id: completion.data.created,
      message: { ...assistantMessage, content: strippedMessage },
      source: sourceFound ? scores[0].name : null,
    },
  ]

  res.status(200).json(newChatFromAssistant)
}
