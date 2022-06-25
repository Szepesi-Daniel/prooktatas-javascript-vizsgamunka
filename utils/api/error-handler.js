export default errorHandler

function errorHandler(res, error) {
  if (isNaN(error)) console.error(error)

  res.json({ 'error-code': error })
}
