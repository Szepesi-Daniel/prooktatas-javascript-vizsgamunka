import User from '../../model/User'
import Router from '../framework/Router'

export default auth

async function auth() {
  const state = await User.IsLoggedIn()

  if (!state) Router.Navigate('/auth')

  return state
}
