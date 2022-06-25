import express from 'express'
import AppointmentController from '../controllers/AppointmentController.js'
import AuthController from '../controllers/AuthController.js'
import EmployeeController from '../controllers/EmployeeController.js'
import admin from '../middlewares/admin.js'
import auth from '../middlewares/auth.js'
import employee from '../middlewares/employee.js'
import guest from '../middlewares/guest.js'
import ApiHandler from '../utils/api/api-handler.js'

const router = express.Router()

/**
 * VENDÉGEKNEK ELÉRHETŐ ÚTVONALAK
 */
router.post('/auth/register', guest, (req, res) =>
  ApiHandler(req, res, AuthController.Register)
)

router.post('/auth/login', guest, (req, res) => {
  ApiHandler(req, res, AuthController.Login)
})

/**
 * FELHASZNÁLÓKNAK ELÉRHETŐ ÚTVONALAK
 */

router.get('/auth/is-logged-in', auth, (req, res) => {
  ApiHandler(req, res, AuthController.CheckLoginState)
})

router.post('/auth/logout', auth, (req, res) => {
  ApiHandler(req, res, AuthController.Logout)
})

router.get('/hairdressers/:index?', auth, (req, res) =>
  ApiHandler(req, res, EmployeeController.GetHairdressers)
)

router.get('/hairdresser/:id/:date?', auth, (req, res) =>
  ApiHandler(req, res, EmployeeController.GetHairdresser)
)

router.post('/book-now', auth, (req, res) =>
  ApiHandler(req, res, AppointmentController.Create)
)

/**
 * ALKALMAZOTAKNAK ELÉRHETŐ ÚTVONALAK
 */
router.get('/appointments/:date', employee, (req, res) => {
  ApiHandler(req, res, AppointmentController.GetByDate)
})

/**
 * ADMINOKNAK ELÉRHETŐ ÚTVONALAK
 */

router.post('/auth/create-employee', admin, (req, res) =>
  ApiHandler(req, res, AuthController.CreateEmployee)
)

router.post('/auth/delete-employee', admin, (req, res) =>
  ApiHandler(req, res, AuthController.DeleteEmployee)
)

router.post('/add-freedom', admin, (req, res) =>
  ApiHandler(req, res, EmployeeController.AddFreedom)
)

router.delete('/appointment', (req, res) =>
  ApiHandler(req, res, AppointmentController.Delete)
)

router.all('/*', (req, res) => {
  res.status(404).json({
    error: 'NotFound',
  })
})

export default router
