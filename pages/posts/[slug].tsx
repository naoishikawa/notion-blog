import React from 'react'
import { getAllPost, getSinglePost } from '../../lib/notionAPI'
import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import Link from 'next/link'

export const getStaticPaths = async() => {
    const allPosts = await getAllPost()
    const paths = allPosts.map(({slug}) => {
        return (
            {params: {slug: slug}}
        )
    })
    return {
        paths: paths,
        fallback: "blocking"
    }
}

export const getStaticProps = async({params}) => {
    const post = await getSinglePost(params.slug)
    return {
      props: {
        post: post
      },
      revalidate: 60,
    }
  }
  
const Post = ({post}) => {
  return (
    <section className='container lg:px-2 px-5 lg:w-2/5 mx-auto mt-20'>
        <h2 className='w-full text-2xl font-medium'>{post.metadata.title}</h2>
        <div className='border-b-2 w-1/3 mt-1 border-sky-900'></div>
        <span className='text-gray-500'>Posted date at {post.metadata.date}</span>
        <br />
        {post.metadata.tags.map((tag: string) => {
            return (
                <p key={tag} className='text-white bg-sky-900 rounded-xl font-medium mt-2 px-2 inline-block mr-2'>{tag}</p>
            )
        })}
        <div className='mt-10 font-medium'>
            <ReactMarkdown 
                components={{
                code({node, inline, className, children}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                    <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                    />
                    ) : (
                    <code className={className}>
                        {children}
                    </code>
                    )
                }
                }}
            >
                children={post.markdown}
            </ReactMarkdown>
            <Link href="/">
                <span className='pd-20 block mt-3 mb-3'>Home</span>
            </Link>
        </div>
    </section>
  )
}

export default Post