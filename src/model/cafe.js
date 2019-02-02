const { Schema, Model } = require('mongoose');
const Joi = require('joi');

const cafeSchema = new Schema({
  property: { type: Number, required: true },
  location: { type: String, require: true },
  tagId: { type: Schema.Types.ObjectId, ref: 'Tags' },
});

cafeSchema.pre('save', (next) => {
  this.location = this.location.toUpperCase();
  next();
});

const validateCafe = (cafe) => {
  const schema = {
    property: Joi.Number().required(),
    location: Joi.string().required(),
    tagid: Joi.string(),
  };
  return Joi.validate(cafe, schema);
};

const Cafe = new Model('Cafe', cafeSchema);

module.exports = {
  cafeSchema, validateCafe, Cafe,
};
