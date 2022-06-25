import errorHandler from './error-handler.js'

export default ApiHandler

async function ApiHandler(req, res, handler) {
  try {
    await handler(req, res)
  } catch (err) {
    errorHandler(err)
  }
}
