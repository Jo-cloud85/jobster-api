import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import Errors from '../errors/index.js'

const register = async (req, res) => {
    const user = await User.create({ ...req.body })
    const token = user.createJWT()
    res
        .status(StatusCodes.CREATED)
        .json({ 
            user: { 
                email: user.email,
                lastName: user.lastName,
                location: user.location,
                name: user.name,
                token
            }
        })
}


const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new Errors.BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new Errors.UnauthenticatedError('Invalid Credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new Errors.UnauthenticatedError('Invalid Credentials')
    }
    // compare password
    const token = user.createJWT()
    res.status(StatusCodes.OK).json({ 
        user: { 
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token
        }
    })
}


const updateUser = async (req, res) => {
    const { email, name, lastName, location } = req.body;

    if (!email || !name || !lastName || !location) {
        throw new Errors.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ _id: req.user.userId });
  
    user.email = email;
    user.name = name;
    user.lastName = lastName;
    user.location = location;
  
    await user.save();
  
    const token = user.createJWT();
  
    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            location: user.location,
            name: user.name,
            token,
        },
    });
};

export default {
    register,
    login,
    updateUser
}
