import fs from 'fs';





// Correct configuration based on the provided a.json
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_READ
const REPO_OWNER = 'CatCodeMe'
const REPO_NAME = 'catcodeme.github.io'

async function fetchAllDiscussions() {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query($repoOwner: String!, $repoName: String!) {
          repository(owner: $repoOwner, name: $repoName) {
            discussions(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                id
                title
                url
                createdAt
                author {
                  login
                  avatarUrl
                  url
                }
                bodyHTML
                reactionGroups {
                  content
                  users {
                    totalCount
                  }
                }
                comments(first: 100) {
                  nodes {
                    id
                    url
                    createdAt
                    author {
                      login
                      avatarUrl
                      url
                    }
                    bodyHTML
                    reactionGroups {
                      content
                      users {
                        totalCount
                      }
                    }
                    replyTo {
                      id
                      author {
                        login
                      }
                    }
                    replies(first: 20) {
                      nodes {
                        id
                        url
                        createdAt
                        author {
                          login
                          avatarUrl
                          url
                        }
                        bodyHTML
                        reactionGroups {
                          content
                          users {
                            totalCount
                          }
                        }
                        replyTo {
                          id
                          author {
                            login
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        repoOwner: REPO_OWNER,
        repoName: REPO_NAME
      }
    })
  })

  const data = await response.json()

  if (data.errors) {
    console.error('GitHub API returned errors:', JSON.stringify(data.errors, null, 2))
    throw new Error('Failed to fetch discussions due to API errors.')
  }

  if (!data.data || !data.data.repository || !data.data.repository.discussions) {
    console.error('Unexpected data structure from GitHub API:', JSON.stringify(data, null, 2))
    throw new Error("Unexpected data structure. Expected 'data.repository.discussions'.")
  }

  return data.data.repository.discussions.nodes
}

// 简化的递归函数，不再使用嵌套查询
function processReplies(replies, parentId, discussionId, discussionTitle, sourceUrl, level = 1) {
  const processedReplies = []

  for (const reply of replies) {
    // Filter out bot comments
    if (reply.author && reply.author.login.endsWith('giscus')) {
      continue
    }

    const processedReply = {
      id: reply.id,
      url: reply.url,
      createdAt: reply.createdAt,
      author: reply.author,
      bodyHTML: reply.bodyHTML,
      reactionGroups: reply.reactionGroups,
      isDiscussion: false,
      title: discussionTitle,
      discussionId: discussionId,
      parentId: parentId, // 直接父级ID
      replyToId: reply.replyTo ? reply.replyTo.id : null, // 引用的评论ID
      replyToAuthor: reply.replyTo ? reply.replyTo.author.login : null, // 引用的评论作者
      level: level, // 嵌套层级
      type: 'reply',
      sourceUrl
    }

    processedReplies.push(processedReply)

    // 递归处理子回复
    if (reply.replies && reply.replies.nodes && reply.replies.nodes.length > 0) {
      const childReplies = processReplies(
        reply.replies.nodes,
        reply.id,
        discussionId,
        discussionTitle,
        sourceUrl,
        level + 1
      )
      processedReplies.push(...childReplies)
    }
  }

  return processedReplies
}

async function main() {
  try {
    const discussions = await fetchAllDiscussions()
    const allComments = discussions.flatMap((discussion) => {
      // Filter out bot discussions if necessary (though Giscus usually comments, not creates discussions)
      if (discussion.author && discussion.author.login.endsWith('[bot]')) {
        return []
      }

      // Determine source URL for the discussion
      let sourceUrl = null
      // First, try to find a giscus comment and use its author.url
      const giscusComment = discussion.comments.nodes.find(
        (comment) => comment.author && comment.author.login === 'giscus'
      )
      if (giscusComment && giscusComment.author && giscusComment.author.url) {
        sourceUrl = giscusComment.author.url
      } else {
        // Fallback: Extract source URL from discussion body
        const match = discussion.bodyHTML.match(/<a href="([^"]+)">/)
        if (match && match[1]) {
          sourceUrl = match[1]
        }
      }

      // Map the main discussion post
      const mainComment = {
        id: discussion.id,
        url: discussion.url,
        createdAt: discussion.createdAt,
        author: discussion.author,
        bodyHTML: discussion.bodyHTML,
        reactionGroups: discussion.reactionGroups,
        isDiscussion: true,
        title: discussion.title,
        discussionId: discussion.id,
        parentId: null,
        replyToId: null,
        replyToAuthor: null,
        level: 0,
        type: 'discussion',
        sourceUrl
      }

      // 处理顶级评论
      const topLevelComments = discussion.comments.nodes
        .filter(comment => !comment.author || !comment.author.login.endsWith('[bot]')) // Filter out bot comments
        .map((comment) => ({
          id: comment.id,
          url: comment.url,
          createdAt: comment.createdAt,
          author: comment.author,
          bodyHTML: comment.bodyHTML,
          reactionGroups: comment.reactionGroups,
          isDiscussion: false,
          title: discussion.title,
          discussionId: discussion.id,
          parentId: discussion.id, // 顶级评论的父级是 discussion
          replyToId: comment.replyTo ? comment.replyTo.id : null,
          replyToAuthor: comment.replyTo ? comment.replyTo.author.login : null,
          level: 1,
          type: 'comment',
          sourceUrl
        }))

      // 处理所有嵌套回复
      const allReplies = discussion.comments.nodes.flatMap((comment) => {
        if (comment.replies && comment.replies.nodes && comment.replies.nodes.length > 0) {
          return processReplies(
            comment.replies.nodes,
            comment.id,
            discussion.id,
            discussion.title,
            sourceUrl,
            2
          )
        }
        return []
      })

      return [mainComment, ...topLevelComments, ...allReplies]
    })

    // Sort all comments and replies together by date
    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // 也生成一个按层级结构组织的版本
    const structuredComments = discussions.map((discussion) => {
      const buildCommentTree = (comments, parentId = null) => {
        return comments
          .filter((comment) => comment.parentId === parentId)
          .map((comment) => ({
            ...comment,
            replies: buildCommentTree(comments, comment.id)
          }))
      }

      const discussionComments = allComments.filter(
        (comment) => comment.discussionId === discussion.id
      )
      const mainDiscussion = discussionComments.find((comment) => comment.isDiscussion)
      const replies = buildCommentTree(
        discussionComments.filter((comment) => !comment.isDiscussion),
        discussion.id
      )

      return {
        ...mainDiscussion,
        replies: replies
      }
    })

    // 保存平铺版本（向后兼容）
    fs.writeFileSync('src/data/comments.json', JSON.stringify(allComments, null, 2))

    // 保存结构化版本
    fs.writeFileSync(
      'src/data/comments-structured.json',
      JSON.stringify(structuredComments, null, 2)
    )

    console.log(
      `Successfully fetched and wrote ${allComments.length} comments to src/data/comments.json`
    )
    console.log(
      `Successfully wrote ${structuredComments.length} structured discussions to src/data/comments-structured.json`
    )

    
    console.log(JSON.stringify(allComments, null, 2))
    console.log('\n--- Structured Comments ---')
    console.log(JSON.stringify(structuredComments, null, 2))

    // --- DEBUG: Log bodyHTML for comments with code blocks ---
    const commentsWithCode = allComments.filter(comment => comment.bodyHTML.includes('<pre><code'));
    if (commentsWithCode.length > 0) {
      console.log('\n--- bodyHTML for comments with code blocks ---');
      commentsWithCode.forEach((comment, index) => {
        console.log(`\nComment ID: ${comment.id}`);
        console.log(`Author: ${comment.author.login}`);
        console.log(`bodyHTML:\n${comment.bodyHTML}`);
      });
      console.log('--------------------------------------------\n');
    } else {
      console.log('\nNo comments with code blocks found in fetched data.\n');
    }
    // --- END DEBUG ---

    // 输出统计信息
    const stats = {
      totalDiscussions: discussions.length,
      totalComments: allComments.length,
      byLevel: {},
      byType: {}
    }

    allComments.forEach((comment) => {
      stats.byLevel[comment.level] = (stats.byLevel[comment.level] || 0) + 1
      stats.byType[comment.type] = (stats.byType[comment.type] || 0) + 1
    })

    console.log('Statistics:', JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error('An error occurred during the fetch process:', error.message)
    process.exit(1) // Exit with an error code to fail the GitHub Action
  }
}

main()