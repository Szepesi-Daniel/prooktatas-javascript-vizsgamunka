import { FlashType } from '../types/FlashType'
import { getHtml } from './fetch'

export default class Controller {
  protected _views: { [key: string]: any } = {}
  protected _layouts: { [key: string]: any } = {}
  protected _defaultViewKey = 'main'
  protected _activeView: any
  protected _title: string

  protected Start() {}

  public Destroy() {
    this._activeView.Destroy()
  }

  public get title() {
    return this._title
  }

  /**
   * Ez a method átadja az irányítást ennek a Controllernek
   */
  public async Control() {
    // A default view meglétének ellenőrzése
    if (!this._views[this._defaultViewKey])
      throw new Error(
        `A ${this._defaultViewKey} view nincs megadva a _views ban`
      )

    // default view példányosítása és tárolása az _activeView ban
    this._activeView = new this._views[this._defaultViewKey]()

    // Szükséges HTML állomány nevének elkérése
    const htmlFileName = this._activeView.htmlFileName

    // Fájl lekérése
    const htmlFile = await getHtml(htmlFileName)

    // View megkérése, hogy renderelje ki a kapott html állományt
    this._activeView.Render(htmlFile)

    // layouts futatása
    for (const [key, value] of Object.entries(this._layouts)) {
      this._layouts[key] = new value()

      this._layouts[key].Control()
    }
    this.Start()
    this._activeView.Start()
  }
}
