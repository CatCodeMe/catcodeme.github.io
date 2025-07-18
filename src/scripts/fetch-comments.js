import fs from 'fs';

// Correct configuration based on the provided a.json
const GITHUB_TOKEN = process.env.GITHUB_TOKEN_READ;
const REPO_OWNER = 'CatCodeMe';
const REPO_NAME = 'catcodeme.github.io';

async function fetchAllDiscussions() {
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
      }
    })
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GitHub API returned errors:", JSON.stringify(data.errors, null, 2));
    throw new Error("Failed to fetch discussions due to API errors.");
  }

  if (!data.data || !data.data.repository || !data.data.repository.discussions) {
    console.error("Unexpected data structure from GitHub API:", JSON.stringify(data, null, 2));
    throw new Error("Unexpected data structure. Expected 'data.repository.discussions'.");
  }

  return data.data.repository.discussions.nodes;
}

async function main() {
  try {
    const discussions = await fetchAllDiscussions();
    const allComments = discussions.flatMap(discussion => {
      // Map the main discussion post
      const mainComment = {
        id: discussion.id,
        url: discussion.url,
        createdAt: discussion.createdAt,
        author: discussion.author,
        bodyHTML: discussion.bodyHTML,
        reactionGroups: discussion.reactionGroups,
        isDiscussion: true,
        title: discussion.title
      };

      // Map the replies to the discussion
      const replies = discussion.comments.nodes.map(comment => ({
        ...comment,
        isDiscussion: false,
        title: discussion.title // Carry over title to replies
      }));

      return [mainComment, ...replies];
    });

    // Sort all comments and replies together by date
    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    fs.writeFileSync('src/data/comments.json', JSON.stringify(allComments, null, 2));
    console.log(`Successfully fetched and wrote ${allComments.length} comments to src/data/comments.json`);

  } catch (error) {
    console.error("An error occurred during the fetch process:", error.message);
    process.exit(1); // Exit with an error code to fail the GitHub Action
  }
}

main();