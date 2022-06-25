import User from '../../model/User'
import Router from '../framework/Router'

export default employee

function employee() {
  const employee = User.IsEmployee()

  if (!employee) {
    Router.Navigate('/')
    return false
  }

  return true
}
