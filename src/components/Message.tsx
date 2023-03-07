import { ChatCompletionRequestMessageRoleEnum } from 'openai'

type MessageProps = {
  role: ChatCompletionRequestMessageRoleEnum
  content: string
}

export default function Message({ role, content }: MessageProps) {
  let color

  if (role === ChatCompletionRequestMessageRoleEnum.User)
    color = 'text-zinc-300'
  else if (role === ChatCompletionRequestMessageRoleEnum.Assistant)
    color = 'text-indigo-300'

  const styles = 'py-4 ' + color

  return <div className={styles}>{content}</div>
}
