import mongoose from 'mongoose'

const EmployeeSchema = new mongoose.Schema(
  {
    _id: false,
    profile_picture: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 100,
      minlength: 20,
    },
    appointments: {
      type: [
        {
          user_id: {
            type: mongoose.Types.ObjectId,
            required: true,
          },
          date: {
            type: mongoose.Schema.Types.Date,
            required: true,
          },
        },
      ],
      default: [],
    },
    freedoms: {
      type: [
        {
          from: {
            type: mongoose.Schema.Types.Date,
            required: true,
          },
          to: {
            type: mongoose.Schema.Types.Date,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
)

export default EmployeeSchema
