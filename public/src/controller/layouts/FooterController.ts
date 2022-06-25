import Controller from '../../lib/framework/Controller'
import FooterView from '../../view/layouts/FooterView'

export default class FooterController extends Controller {
  protected _views: any = { main: FooterView }
}
