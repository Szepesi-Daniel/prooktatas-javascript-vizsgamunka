import Controller from '../../lib/framework/Controller'
import { FlashType } from '../../lib/types/FlashType'
import Flash from '../../model/Flash'
import FlashView from '../../view/layouts/FlashView'

export default class FlashController extends Controller {
  protected _views: { [key: string]: any } = { main: FlashView }

  protected Start(): void {
    this.ShowFlash()
  }

  public ShowFlash() {
    if (Flash.flash) {
      const flash = Flash.flash

      Flash.flash = null

      this._activeView.ShowFlash(flash.type, flash.message)
    }
  }

  public AddFlash(type: FlashType['type'], message: string) {
    Flash.flash = { type, message }
  }
}
