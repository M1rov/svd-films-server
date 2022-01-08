const UserService = require('../service/user-service')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return next(ApiError.BadRequest('Validation Error', errors.array()))
      }
      const {email, password} = req.body;
      const userData = await UserService.registration(email, password);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const {email, password} = req.body;
      const userData = await UserService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true});
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const {refreshToken} = req.cookies;
      const token = await UserService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (err) {
      next(err);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await UserService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async getRated(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async addRated(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async removeRated(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async getFavourite(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async addFavourite(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async removeFavourite(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async getLater(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async addLater(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

  async removeLater(req, res, next) {
    try {

    } catch (err) {
      next(err);
    }
  }

}

module.exports = new UserController();