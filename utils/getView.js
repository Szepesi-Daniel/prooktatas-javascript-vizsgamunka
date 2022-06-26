import path from 'path'
import config from '../config.js'

export default getView

function getView(filePath) {
  return path.join(config.basePath, '/views', filePath)
}
