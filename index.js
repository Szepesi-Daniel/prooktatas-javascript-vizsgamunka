import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import apiRouter from './routers/api.js'
import moogoose from 'mongoose'
import 'dotenv/config'
import session from 'express-session'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import MongoDBStore from 'connect-mongodb-session'

const SESSION_NAME = process.env.SESSION_NAME
const SESSION_COLLECTION = process.env.SESSION_COLLECTION

if (!SESSION_NAME)
  throw new Error(
    'Kérlek add meg a SESSION_NAME környezeti változót a .env fájlban'
  )

if (!SESSION_COLLECTION)
  throw new Error(
    'Kérlek add meg a SESSION_COLLECTION környezeti változót a .env fájlban'
  )

const mongoStore = MongoDBStore(session)

const store = new mongoStore({
  collection: SESSION_COLLECTION,
  uri: process.env.MONOGDB_URI,
  expires: 1000,
})
const app = express()
const PORT = 3000
const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(
  session({
    name: process.env.SESSION_NAME,
    secret: 'SESS_SECRET',
    store: store,
    saveUninitialized: false,
    resave: false,
    cookie: {
      sameSite: false,
      secure: false,
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
    },
  })
)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)
app.use(cookieParser())

const MONOGDB_URI = process.env.MONOGDB_URI

if (!MONOGDB_URI) {
  throw new Error('Add meg a MONGODB_URI környezeti változót a .env fájlban')
}

moogoose.connect(process.env.MONOGDB_URI, (err) => {
  if (err) throw err
  app.listen(PORT, () => {
    console.log('A szerver futt')
  })
})

app.use(express.urlencoded({ extended: false }))

app.use(express.static('public'))

app.use('/api', apiRouter)

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'))
})