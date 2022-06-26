import type { RouteType, URLParameterType } from '../types/RouterTypes'

export default class Router {
  /**
   * Útvonalak tárolója
   */
  private static _routes: RouteType[] = []
  /**
   * query paraméterek tárolója
   */
  private static _query: URLParameterType = {}
  /**
   * URL paraméterek tárolója
   */
  private static _params: URLParameterType = {}
  /**
   * eventek tárolója
   */
  private static _events: { [key: string]: Function[] } = {}
  /**
   * aktív útvonal tárolója
   */
  private static _route: RouteType
  private static _notFoundController: any
  private static _routeRegex = /^([/]{1}[A-z0-9:-]{0,})+$/
  private static _activeController: any

  /**
   * Visszaadja a jelenleg útvonalat
   */
  public static get route() {
    return this._route.route
  }

  public static set notFoundController(controller: any) {
    this._notFoundController = controller
  }

  public static get params() {
    return this._params
  }
  /**
   * Új útvonalat hoz létre
   * @param route
   */
  public static AddRoute(route: RouteType) {
    // 1. útvonal validálása
    const valid = this._routeRegex.test(route.route)

    if (!valid) throw new Error('Hibás útvonal')

    // 2. útvonal hozzáadása a _routes hoz
    this._routes.push(route)
  }

  /**
   * Eltávolít egy útvonalat
   * @param route
   */
  public static RemoveRoute(route: string) {
    // Útvonal megkeresése a _routes tömbből és törlése
    const index = this._routes.findIndex((e) => e.route === route)

    this._routes.splice(index, 1)
  }

  /**
   * Átnavigál egy másik útvonalra
   * @param route
   */
  public static Navigate(
    route: string,
    title?: string,
    queries?: { [key: string]: string }
  ) {
    // 1. route validálása
    const valid = this._routeRegex.test(route)

    if (!valid) throw new Error('Hibás útvonal')

    // 2. leellenőrizni, hogy az aktív útvonal megegyezik-e az újjal

    // 3. Ha megegyezik akkor queries hozzáadása az url hez és kilépés
    // 4. URL cseréje és queryk hozzáadása
    history.pushState({}, null, route)

    if (title) document.title = title

    // 5. Az útvonalhoz tartozó Controller betöltése
    this.CalcRoute()

    return this
  }

  /**
   * Felíratkozik egy eventre, mikor az event megívódik a megadott callback függvény meghívásra kerűl
   * @param type
   * @param callback
   */
  public static On(type: string, callback: Function) {}
  /**
   *
   * Meghív egy eventet és a rá felíratkozott függvényeket
   * @param type
   */
  private static Emit(type: string) {}
  /**
   * Leíratkozik egy eventről
   * @param type
   * @param callback
   */
  public static Off(type: string, callback: Function) {}

  /**
   * Kiszámítja az útvonalat,paramétereket az URL ből
   */
  static async CalcRoute() {
    // 1. Az útvonal lekérése
    const path = location.pathname

    // 2. Az útvonal megkeresése az útvonalak közül
    let found: any = false

    for (const route of this._routes) {
      const arr = route.route.split('/')
      const arr2 = path.split('/')

      arr.splice(0, 1)
      arr2.splice(0, 1)

      /* let wasOptional = false */

      const params: { [key: string]: string } = {}

      for (const [index, str] of arr2.entries()) {
        const str2 = arr[index]
        const isOptional = str2?.endsWith('?')
        const isKey = str2?.startsWith(':')

        /* if (isOptional && !wasOptional) wasOptional = true
        if (!isOptional && wasOptional) break */
        if (!isOptional && str2 === undefined) break
        if (!isKey && str2 !== str) break
        if (!str && str2.length !== 0) break
        if (arr.length !== arr2.length) break

        if (isKey) params[str2.slice(1)] = str

        if (!isOptional) if (index !== arr.length - 1) continue

        this._params = params
        found = route
      }

      if (found) {
        this._route = found
        break
      }
    }
    // 3. Ha nincs ilyen útvonal regisztrálva akkor visszatér a notFound útvonalal
    if (!found) {
      if (this._activeController !== null) this._activeController?.Destroy()

      this._activeController = new this._notFoundController()
      this._activeController.Control()

      this._route = {
        route: 'notFound',
        controller: this._activeController,
      }

      this.SetTitle()
      return
    }
    // 4. Lefutatja az összes middlewares t ha van
    const middlewares = found.middlewares || []

    let success = true

    for await (const middlewear of middlewares) {
      const res = await middlewear()

      if (!res) {
        success = false
        break
      }
    }

    // 5. Ha nem sikerül kilépés
    if (!success) return

    // 6. Ha sikeres akkor betőlti a Controllert és az átveszi az oldal írányítását
    if (this._activeController !== null) this._activeController?.Destroy()

    this._activeController = new found.controller()
    this._activeController.Control()

    this.SetTitle()
  }

  /**
   * Beállítja a titlet
   * @param title
   */
  public static SetTitle(title?: string) {
    document.title = title || this._activeController.title
  }

  public static UpdateParams(key: string, value: string) {
    const route = Router.route
    const path = location.pathname

    if (route.search(':' + key) === -1 || !this._params[key]) return

    const routeArr = route.split('/')
    const pathArr = path.split('/')

    const index = routeArr.findIndex((e) => e === ':' + key)

    pathArr[index] = value
    this._params[key] = value

    history.replaceState({}, null, pathArr.join('/'))
  }

  public static Run() {
    this.CalcRoute()

    window.addEventListener('popstate', (e) => {
      this.CalcRoute()
    })
  }
}
