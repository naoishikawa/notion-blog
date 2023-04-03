import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"
import { NUMBER_OF_POSTS_PER_PAGE } from "../constants/constants"

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({notionClient: notion})

export const getAllPost = async() => {
    const posts = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        page_size: 100,
        sorts: [
            {
                property: "Date",
                direction: "descending"
            }
        ],
        filter: {
            and: [
                {
                    property: "Published",
                    formula: {
                        checkbox: {
                            equals: true
                        }
                    }
                }
            ]
        }

    })
    const allPosts = posts.results
    return allPosts.map((post) => {
        return getPageMetaData(post)
    })
}

const getPageMetaData = (post) => {
    const getTags = (tags) => {
        const allTags = tags.map((tag) => {
            return tag.name
        })
        return allTags
    }
    return {
        id: post.id,
        title: post.properties.名前.title[0].plain_text,
        description: post.properties.Description.rich_text[0].plain_text,
        date: post.properties.Date.date.start,
        slug: post.properties.Slug.rich_text[0].plain_text,
        tags: getTags(post.properties.タグ.multi_select)
    }
}

export const getSinglePost = async(slug) => {
    const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter: {
            property: "Slug",
            formula: {
                string: {
                    equals: slug
                }
            }
        }
    })
    const page = response.results[0]
    const metadata = getPageMetaData(page)

    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);
    console.log(mdString)


    return {
        metadata,
        markdown: mdString
    }
}

export const getPostsForTopPage = async (pageSize: number) => {
    const allPosts = await getAllPost()
    const fourPosts = allPosts.slice(0, pageSize)
    return fourPosts
}

export const getPostsByPage = async(page: number) => {
    const allPosts = await getAllPost()
    const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE
    const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE

    return allPosts.slice(startIndex, endIndex)
}

export const getNumberOfPages = async() => {
    const allPosts = await getAllPost()

    return (
        Math.ceil(allPosts.length / NUMBER_OF_POSTS_PER_PAGE)
    )
}

export const getPostByTagAndPage = async(tagName: string, page:number) => {
    const allPosts = await getAllPost()
    const posts = allPosts.filter((post) => {
        return post.tags.find((tag: string) => tag === tagName)
    })
    const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE
    const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE

    return posts.slice(startIndex, endIndex)
}


export const getNumberOfPagesByTag = async(tagName: string) => {
    const allPosts = await getAllPost()
    const posts = allPosts.filter((post) => {
        return post.tags.find((tag: string) => tag === tagName)
    })

    return (
        Math.ceil(posts.length / NUMBER_OF_POSTS_PER_PAGE)
    )
}

// export const getAllTags = async() => {
//     const allPosts = await getAllPost()
//     const allTagsDuplicationList = allPosts.flatMap((post) => post.tags)
//     const set = new Set(allTagsDuplicationList)
//     const allTagsList = Array.from(set)
//     console.log(allTagsList)
// }

export const getAllTags = async () => {
    const allPosts = await getAllPost();
    const allTagsList = allPosts.flatMap((post) => post.tags).filter((tag, index, array) => {
      return array.indexOf(tag) === index;
    });
    return allTagsList
  };