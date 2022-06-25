import mongoose from 'mongoose'
import UserSchema from '../schemas/UserSchema.js'

const UserModel = mongoose.model('User', UserSchema)

export default UserModel
