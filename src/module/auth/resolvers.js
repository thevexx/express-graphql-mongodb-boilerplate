const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto-random-string')
const moment = require('moment')

const redis = require('@app/redis')
const {
  verifyRequestMail,
  resetPasswordMail
} = require('@app/module/auth/mail')
const { verifyRequestService } = require('@app/module/auth/service')
const UserModel = require('@app/module/auth/user')

const user = {
  name: 'user',
  type: 'User!',
  resolve: async ({ context: { user } }) => user
}

const signIn = {
  name: 'signIn',
  type: 'AccessToken!',
  args: {
    email: 'String!',
    password: 'String!'
  },
  resolve: async ({ args: { email, password } }) => {
    try {
      const user = await UserModel.emailExist(email)
      if (!user) {
        return Promise.reject(new Error('User not found.'))
      }

      const comparePassword = await user.comparePassword(password)
      if (!comparePassword) {
        return Promise.reject(new Error('Password is incorrect.'))
      }

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const signUp = {
  name: 'signUp',
  type: 'AccessToken!',
  args: {
    email: 'String!',
    password: 'String!'
  },
  resolve: async ({ args: { email, password }, context: { i18n } }) => {
    try {
      let user = await UserModel.emailExist(email)
      if (user) {
        return Promise.reject(new Error('Email has already been taken.'))
      }

      const hash = bcrypt.hashSync(password, 10)

      user = await new UserModel({
        email,
        password: hash,
        locale: i18n.language
      }).save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      const token = await verifyRequestService(user)

      verifyRequestMail(email, token)

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const logout = {
  name: 'logout',
  type: 'Succeed!',
  resolve: async ({ context: { accessToken } }) => {
    try {
      await redis.rpush('expiredTokens', accessToken)
      redis.expire('expiredTokens', process.env.REDIS_EXPIRE)

      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const verifyRequest = {
  name: 'verifyRequest',
  type: 'Succeed!',
  resolve: async ({ context: { user } }) => {
    try {
      const token = await verifyRequestService(user)

      verifyRequestMail(user.email, token)
      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const verify = {
  name: 'verify',
  type: 'AccessToken!',
  args: { token: 'String!' },
  resolve: async ({ args: { token } }) => {
    try {
      const user = await UserModel.findOne({
        'account.verification.token': token
      })
      if (!user) {
        return Promise.reject(new Error('Access Token is not valid or has expired.'))
      }

      user.set({
        account: {
          verification: {
            verified: true,
            token: null,
            expiresIn: null
          }
        }
      })

      await user.save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const resetPassword = {
  name: 'resetPassword',
  type: 'Succeed!',
  args: { email: 'String!' },
  resolve: async ({ args: { email } }) => {
    try {
      const user = await UserModel.findOne({ email })
      if (!user) {
        return Promise.reject(new Error('User not found.'))
      }

      const token = crypto({ length: 48, type: 'url-safe' })
      const expiresIn = moment().add(7, 'days')

      user.set({
        account: {
          resetPassword: {
            token,
            expiresIn
          }
        }
      })

      await user.save()

      resetPasswordMail(email, token)

      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const newPassword = {
  name: 'newPassword',
  type: 'AccessToken!',
  args: { token: 'String!', newPassword: 'String!' },
  resolve: async ({ args: { token, newPassword } }) => {
    try {
      const user = await UserModel.findOne({
        'account.resetPassword.token': token
      })
      if (!user) {
        return Promise.reject(new Error('Access Token is not valid or has expired.'))
      }

      const hash = bcrypt.hashSync(newPassword, 10)

      user.set({
        password: hash,
        account: {
          resetPassword: {
            token: null,
            expiresIn: null
          }
        }
      })

      await user.save()

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      )

      return { accessToken }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const changePassword = {
  name: 'changePassword',
  type: 'Succeed!',
  args: { currentPassword: 'String!', newPassword: 'String!' },
  resolve: async ({
    args: { currentPassword, newPassword },
    context: { user }
  }) => {
    try {
      const comparePassword = await user.comparePassword(currentPassword)
      if (!comparePassword) {
        return Promise.reject(new Error('Current password is incorrect.'))
      }

      const hash = bcrypt.hashSync(newPassword, 10)

      user.set({ password: hash })

      await user.save()

      return { succeed: true }
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const updateUser = {
  name: 'updateUser',
  type: 'User!',
  args: { email: 'String!', firstName: 'String!', lastName: 'String!' },
  resolve: async ({ args: { email, firstName, lastName }, context: { user } }) => {
    try {
      if (user.email !== email) {
        const userExist = await UserModel.findOne({ email })
        if (userExist) {
          return Promise.reject(new Error('Email has already been taken.'))
        }
      }

      user.set({
        email,
        firstName,
        lastName
      })

      await user.save()

      return user
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

const switchLocale = {
  name: 'switchLocale',
  type: 'User!',
  args: { locale: 'Locale!' },
  resolve: async ({ args: { locale }, context: { user } }) => {
    try {
      user.set({ locale })

      await user.save()

      return user
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = {
  user,
  signIn,
  signUp,
  logout,
  verifyRequest,
  verify,
  resetPassword,
  newPassword,
  changePassword,
  updateUser,
  switchLocale
}
