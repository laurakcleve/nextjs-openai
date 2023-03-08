type MessageSourceProps = {
  slug: string
}

export default function MessageSource({ slug }: MessageSourceProps) {
  const url = 'https://blog.jimmydc.com/' + slug + '/'
  return (
    <div className='pt-6'>
      <a href={url} className='text-orange-100 border-b-2 border-b-orange-300'>
        Source
      </a>
    </div>
  )
}
