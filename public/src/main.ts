import AppointmentController from './controller/AppointmentController'
import AuthController from './controller/AuthController'
import DateController from './controller/admin/DateController'
import HairdressersController from './controller/HairdressersController'
import NotFoundController from './controller/NotFoundController'
import Router from './lib/framework/Router'
import auth from './lib/middlewares/auth'
import employee from './lib/middlewares/employee'
import guest from './lib/middlewares/guest'

Router.notFoundController = NotFoundController

Router.AddRoute({
  route: '/auth',
  controller: AuthController,
  middlewares: [guest],
})

Router.AddRoute({
  route: '/',
  controller: HairdressersController,
  middlewares: [auth],
})

Router.AddRoute({
  route: '/appointment/:id/:date',
  controller: AppointmentController,
  middlewares: [auth],
})

Router.AddRoute({
  route: '/admin/:date',
  controller: DateController,
  middlewares: [auth, employee],
})

Router.Run()
