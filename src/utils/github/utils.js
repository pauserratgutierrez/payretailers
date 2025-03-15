const baseURL = 'https://api.github.com'
const headers = {
  'Authorization': `token ${process.env.GITHUB_PAT}`,
  'Accept': 'application/vnd.github.v3+json'
}

export async function GHMetadata(owner, repo, branch = 'main', path) {
  try {
    const url = `${baseURL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    const response = await fetch(url, { headers })

    if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)

    const data = await response.json()
    const files = Array.isArray(data) ? data.filter(i => i.type === 'file') : []

    return files.map(file => ({
      name: file.name,
      sha: file.sha,
      size: file.size,
      download_url: file.download_url,
      sourceData: { owner, repo, branch, path }
    }))
  } catch (error) {
    throw error
  }
}

export async function GHContent(downloadUrl) {
  try {
    const response = await fetch(downloadUrl, { headers })

    if (!response.ok) throw new Error(`GitHub content download error: ${response.status} ${response.statusText}`)

    return await response.text()
  } catch (error) {
    throw error
  }
}