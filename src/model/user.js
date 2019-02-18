const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { Cafe } = require('./cafe');
const { Tag, tagSchema } = require('./tag');

const usersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  oauth: { type: String, enum: ['google', 'kakao', 'local'], required: true },
  createdAt: { type: Date, default: Date.now },
  tags: { type: Schema.Types.ObjectId, ref: Tag },
  top3Tags: [{ type: String, enum: Object.keys(tagSchema.obj) }],
  favorites: [{ type: Schema.Types.ObjectId, ref: Cafe }],
});

usersSchema.pre('save', function preSave(next) {
  this.name = this.name.toUpperCase();
  if (!this.createdAt) this.createdAt = Date.now;
  next();
});

usersSchema.statics.findOneByEmail = function findOneByEmail(email) {
  return this.findOne({ email });
};

usersSchema.statics.create = async function createUser(user) {
  const newUser = await new this(user).save();
  return newUser;
};

const validateUser = (user) => {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    oauth: Joi.string(),
    createdAt: Joi.date(),
    tags: Joi.string(),
    favorites: Joi.array(),
    top3Tags: Joi.array(),
  };
  return Joi.validate(user, schema);
};

const User = model('Users', usersSchema);

module.exports = {
  usersSchema, validateUser, User,
};
