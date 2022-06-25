import mongoose from 'mongoose'
import EmployeeSchema from './EmployeeSchema.js'

const UserSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      maxlength: 255,
      unique: true,
      validate: {
        validator: (v) =>
          v && /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(v),
        message: 'Érvénytelen e-mail cím',
      },
    },
    password: {
      required: true,
      type: String,
    },
    tel: {
      type: String,
      required: true,
      unique: true,
    },
    admin: {
      type: Number,
      default: 0,
    },
    employee: {
      type: EmployeeSchema,
      default: null,
    },
  },
  { timestamps: true }
)

export default UserSchema
