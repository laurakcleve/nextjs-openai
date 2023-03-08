import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

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

  const styles = 'prose prose-invert ' + color

  return (
    <div
      className={styles}
      dangerouslySetInnerHTML={{
        __html: remark().use(remarkHtml).processSync(content).toString(),
      }}
    />
  )
}
