const db = require('../db/index')
const bcrypt = require('bcrypt');
const MailService = require('./mail-service')
const TokenService = require('./token-service')
const uuid = require('uuid')
const ApiError = require('../exceptions/api-error')



class UserService {
  LATER_MOVIE = 'later_film';
  FAVOURITE_MOVIE = 'favourite_film';
  RATED_MOVIE = 'rated_film';
  LATER_TV = 'later_tv';
  FAVOURITE_TV = 'favourite_tv';
  RATED_TV = 'rated_tv';


  async registration(email, password) {
    const user = (await db.query(`SELECT * FROM "user" WHERE email = '${email}'`))[0];
    if(user) {
      throw ApiError.BadRequest(`User with the email ${email} is already exists.`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();

    const newUser = (await db.query(`INSERT INTO "user"(email, username, password, isActivated, activationLink) VALUES ('${email}', '${email.split('@')[0]}', '${hashPassword}', false, '${activationLink}') RETURNING *`))[0];
    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/unauthorized/user/activate/${activationLink}`);
    return TokenService.generateAndSaveTokens(newUser)
  }

  async changeUsername(username, userId) {
    return (await db.query(`UPDATE "user" SET username = '${username}' WHERE id = '${userId}' RETURNING username`))[0];
  }

  async login(email, password) {
    const user = (await db.query(`SELECT * FROM "user" WHERE email = '${email}'`))[0];
    if(!user) {
      throw ApiError.BadRequest(`User with the email ${email} is not registered`);
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if(!isPassEquals){
      throw ApiError.BadRequest('Incorrect password');
    }
    return TokenService.generateAndSaveTokens(user)
  }

  async logout(refreshToken) {
    return await TokenService.removeToken(refreshToken);
  }

  async activate(activationLink) {
    const user = (await db.query(`SELECT * FROM "user" WHERE activationlink = '${activationLink}'`))[0];
    if(!user) {
      throw ApiError.BadRequest('Incorrect activation link');
    }
    await db.query(`UPDATE "user" SET isactivated='true' WHERE id='${user.id}'`);
    return user;
  }

  async refresh(refreshToken) {
    if(!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await TokenService.findToken(refreshToken);
    if(!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = (await db.query(`SELECT * FROM "user" WHERE id = ${userData.id}`))[0];
    return TokenService.generateAndSaveTokens(user)
  }

  async getMovieListsLength(user_id) {
    return (await db.query(`SELECT ( SELECT COUNT(*) FROM later_film WHERE user_id = '${user_id}' ) AS later, ( SELECT COUNT(*) FROM favourite_film WHERE user_id = '${user_id}' ) AS favourite, ( SELECT COUNT(*) FROM rated_film WHERE user_id = '${user_id}' ) AS rated`))[0];
  }

  async getTVListsLength(user_id) {
    return (await db.query(`SELECT ( SELECT COUNT(*) FROM later_tv WHERE user_id = '${user_id}' ) AS later, ( SELECT COUNT(*) FROM favourite_tv WHERE user_id = '${user_id}' ) AS favourite, ( SELECT COUNT(*) FROM rated_tv WHERE user_id = '${user_id}' ) AS rated`))[0];
  }

  async getUserInfo (user_id) {
    return {
      username: (await db.query(`SELECT username FROM "user" WHERE id = '${user_id}'`))[0].username,
      listsLength: {
        tv: await this.getTVListsLength(user_id),
        movie: await this.getMovieListsLength(user_id)
      }
    }
  }
}

module.exports = new UserService();