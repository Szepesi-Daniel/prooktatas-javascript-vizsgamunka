import config from './config'

export { getHtml, api }

async function getHtml(fileName: string) {
  const result = await (
    await fetch(config.server_url + 'html/' + fileName + '.html')
  ).text()

  return result
}

async function api(
  path: string,
  data?: any,
  cfg: { method: string } = { method: 'GET' }
) {
  let result

  if (cfg.method === 'GET') {
    result = await await (
      await fetch(config.server_url + 'api' + path, {
        ...cfg,
      })
    ).json()
  } else {
    result = await await (
      await fetch(config.server_url + 'api' + path, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...cfg,
        body: JSON.stringify(data) || null,
      })
    ).json()
  }

  return result
}
