import Controller from '../framework/Controller'

type RouteType = {
  route: string
  controller: typeof Controller
  middlewares?: Function[]
}

type URLParameterType = { [key: string]: string }

export { RouteType, URLParameterType }
