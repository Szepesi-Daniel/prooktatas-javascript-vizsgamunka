import { api } from '../lib/framework/fetch'

export default class Hairdresser {
  public static async GetHairdressers() {
    const result = await await api('/hairdressers')

    return result
  }
}
