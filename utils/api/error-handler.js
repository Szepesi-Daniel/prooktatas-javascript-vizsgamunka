export default errorHandler

function errorHandler(res, error) {
  if (isNaN(error)) throw new Error(error)

  res.json({ 'error-code': error })
}
