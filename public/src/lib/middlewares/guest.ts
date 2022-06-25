import User from '../../model/User'
import Router from '../framework/Router'

export default guest

async function guest() {
  const state = await User.IsLoggedIn()

  if (state) Router.Navigate('/')

  return !state
}
