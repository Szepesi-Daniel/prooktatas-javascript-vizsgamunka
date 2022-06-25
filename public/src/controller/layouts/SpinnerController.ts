import Controller from '../../lib/framework/Controller'
import SpinnerView from '../../view/layouts/SpinnerView'

export default class SpinnerController extends Controller {
  protected _views: { [key: string]: any } = { main: SpinnerView }

  public Hide() {
    this._activeView.Hide()
  }

  public Show() {
    this._activeView.Show()
  }
}
