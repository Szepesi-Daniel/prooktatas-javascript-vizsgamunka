import Controller from '../lib/framework/Controller'
import Router from '../lib/framework/Router'
import { $id } from '../lib/utils/selectors'
import NotFoundView from '../view/NotFoundView'
import FooterController from './layouts/FooterController'
import NavController from './layouts/NavController'

export default class NotFoundController extends Controller {
  protected _views: { [key: string]: any } = { main: NotFoundView }
  protected _layouts: { [key: string]: any } = {
    nav: NavController,
  }
  protected _title: string = '404'
}
