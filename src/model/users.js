const { Schema, Model } = require('mongoose');
const Joi = require('joi');

const usersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  oauth: { type: String, enum: ['google', 'kakao', 'local'], required: true },
  createdAt: { type: Date, default: Date.now },
  tagId: { type: Schema.Types.ObjectId, ref: 'Tags' },
});

usersSchema.pre('save', (next) => {
  this.name = this.name.toUpperCase();
  if (!this.createdAt) this.createdAt = Date.now;
  next();
});

const validateUser = (user) => {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string().required(),
    oauth: Joi.string().required(),
    createdAt: Joi.date(),
    tagId: Joi.string(),
  };
  return Joi.validate(user, schema);
};

const Users = new Model('Users', usersSchema);

module.exports = {
  usersSchema, validateUser, Users,
};
