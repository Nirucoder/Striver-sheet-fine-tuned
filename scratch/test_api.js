const fetch = require('node-fetch');

const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
      }
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        submissionCalendar
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({ query, variables: { username: "Nirattay", limit: 500 } }),
})
.then(r => r.json())
.then(d => {
    console.log("Success:", JSON.stringify(d).substring(0, 500));
})
.catch(console.log);
