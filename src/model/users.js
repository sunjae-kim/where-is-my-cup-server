const { Schema, model } = require('mongoose');
const Joi = require('joi');

const usersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  oauth: { type: String, enum: ['google', 'kakao', 'local'], required: true },
  createdAt: { type: Date, default: Date.now },
  tagId: { type: Schema.Types.ObjectId, ref: 'Tags' },
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
    email: Joi.string().required(),
    password: Joi.string().required(),
    oauth: Joi.string(),
    createdAt: Joi.date(),
    tagId: Joi.string(),
  };
  return Joi.validate(user, schema);
};

const Users = model('Users', usersSchema);

module.exports = {
  usersSchema, validateUser, Users,
};
