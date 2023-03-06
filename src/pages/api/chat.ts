// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import type { CreateChatCompletionResponse } from 'openai'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  organization: 'org-vBOX7k6OuVhsci26Jxd1eIAS',
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateChatCompletionResponse>
) {
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: req.body,
  })

  const result = completion.data

  res.status(200).json(result)
}
