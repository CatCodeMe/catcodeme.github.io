import fs from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN_READ
const DISCUSSION_CATEGORY_NAME = 'General';
const REPO_OWNER = 'catcodeme';
const REPO_NAME = 'catcodeme.github.io';

async function fetchDiscussions(categoryId) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query($repoOwner: String!, $repoName: String!, $categoryName: String!) {
          repository(owner: $repoOwner, name: $repoName) {
            discussions(first: 100, categoryId: $categoryName, orderBy: {field: CREATED_AT, direction: DESC}) {
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
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        repoOwner: REPO_OWNER,
        repoName: REPO_NAME,
        categoryId: categoryId
      }
    })
  });

  const data = await response.json();

  // Check for API errors in the response
  if (data.errors) {
    console.error("GitHub API returned errors:", JSON.stringify(data.errors, null, 2));
    throw new Error("Failed to fetch discussions due to API errors.");
  }

  // Check for unexpected data structure
  if (!data.data || !data.data.repository || !data.data.repository.discussionCategory) {
    console.error("Unexpected data structure from GitHub API:", JSON.stringify(data, null, 2));
    if (data.data && data.data.repository && !data.data.repository.discussionCategory) {
        throw new Error(`Could not find the discussion category: '${DISCUSSION_CATEGORY_NAME}'. Please check the name.`);
    }
    throw new Error("Unexpected data structure received from GitHub API.");
  }

  return data.data.repository.discussionCategory.discussions.nodes;
}

async function getDiscussionCategoryId() {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        query($repoOwner: String!, $repoName: String!) {
          repository(owner: $repoOwner, name: $repoName) {
            discussionCategories(first: 10) {
              nodes {
                id
                name
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
  });
  const data = await response.json();
  if (data.errors) {
    console.error("GitHub API returned errors while fetching categories:", JSON.stringify(data.errors, null, 2));
    throw new Error("Failed to fetch discussion categories.");
  }
  const category = data.data.repository.discussionCategories.nodes.find(c => c.name === DISCUSSION_CATEGORY_NAME);
  if (!category) {
    throw new Error(`Discussion category '${DISCUSSION_CATEGORY_NAME}' not found.`);
  }
  return category.id;
}

async function main() {
  const categoryId = await getDiscussionCategoryId();
  const discussions = await fetchDiscussions(categoryId);
  const comments = discussions.flatMap(discussion => {
    return [
      {
        id: discussion.id,
        url: discussion.url,
        createdAt: discussion.createdAt,
        author: discussion.author,
        bodyHTML: discussion.bodyHTML,
        reactionGroups: discussion.reactionGroups,
        isDiscussion: true,
      },
      ...discussion.comments.nodes.map(comment => ({
        id: comment.id,
        url: comment.url,
        createdAt: comment.createdAt,
        author: comment.author,
        bodyHTML: comment.bodyHTML,
        reactionGroups: comment.reactionGroups,
        isDiscussion: false,
      }))
    ];
  });

  fs.writeFileSync('src/data/comments.json', JSON.stringify(comments, null, 2));
}

main();