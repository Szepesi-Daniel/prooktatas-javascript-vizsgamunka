import View from '../../lib/framework/View'
import { $id } from '../../lib/utils/selectors'

export default class FlashView extends View {
  protected _htmlFileName: string = 'flash'
  _root: string = 'flash'

  public Start(): void {
    $id('close-flash').addEventListener('click', (e) => {
      $id('flash').classList.remove('active')
      $id('flash').classList.add('close')
    })
  }

  public ShowFlash(type: string, message: string) {
    $id(this._root).classList.add(`flash-${type}`)
    $id(this._root).classList.add('active')
    $id('flash-message').innerHTML = message
  }
}
