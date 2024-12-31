const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { randomKey, message } = require("../utils");

const controller = {
  async login(req, res) {
    try {
      const { _id, name, email, power, avatar, type, expDate } = req.user;
      const payload = {
        _id,
        name,
        email,
        avatar,
        type,
        expDate,
      };

      if (power === 420 && type === "admin") {
        payload.isAdmin = true;
      } else if (power === 10 && type === "user") {
        payload.isBasicUser = true;
      } else if (power === 20 && type === "user") {
        payload.isAdvUser = true;
      } else {
        payload.isFreeUser = true;
      }

      const token = jwt.sign(payload, process.env.AUTH_SECRET, {
        expiresIn: "7 days",
      });

      res.json({ user: payload, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async getUser(req, res) {
    try {
      const { user } = req;
      res.json({ user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async refreshToken(req, res) {
    try {
      const { token: oldToken } = req.body;
      const validateToken = jwt.verify(oldToken, process.env.AUTH_SECRET);
      if (!validateToken) throw new Error(`token isn't valid`);
      const user = await User.findOne({ _id: validateToken._id }).select(
        "+power"
      );
      const { _id, name, email, power, avatar, type } = user;

      const payload = {
        _id,
        name,
        email,
        avatar,
        type,
      };

      if (power === 420 && type === "admin") {
        payload.isAdmin = true;
      } else if (power === 20 && type === "user") {
        payload.isAdvUser = true;
      } else if (power === 10 && type === "user") {
        payload.isBasicUser = true;
      } else if (power === 1 && type === "user") {
        payload.isFreeUser = true;
      }

      const token = jwt.sign(payload, process.env.AUTH_SECRET, {
        expiresIn: "7 days",
      });

      res.json({ user: payload, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
  async socialLogin(req, res) {
    try {
      delete req.user;
      const { provider, id, displayName, email, picture } = req.passportUser;
      if (provider === "google") {
        const user = await User.findOne({ email });
        if (!user) {
          await User.create({
            name: displayName,
            email,
            password: id + process.env.SOCIAL_LOGIN_PASS,
            avatar: picture,
          });
        }
        const credential = { email, id, provider, key: randomKey(20) };
        return res.redirect(
          `${process.env.BASE_URL}/social-login?c=${btoa(
            JSON.stringify(credential)
          )}`
        );
      }
      throw new Error(`provider isn't google`);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message });
    }
  },
};

module.exports = controller;
