const { Schema, model } = require('mongoose');
const Joi = require('joi');

const cafeSchema = new Schema({
  property: { type: Number, default: 0 },
  title: { type: String, required: true },
  images: [String],
  contact: String,
  addresses: { type: [String], required: true },
  location: Object,
  openingHours: [Object],
  menus: [Object],
  homepage: String,
  convenience: String,
  description: String,
  tagId: { type: Schema.Types.ObjectId, ref: 'Tags' },
});

const validateCafe = (cafe) => {
  const schema = {
    property: Joi.number(),
    title: Joi.string().required(),
    images: Joi.array(),
    constact: Joi.string(),
    addresses: Joi.array(),
    location: Joi.object(),
    openingHours: Joi.array(),
    menus: Joi.array(),
    homepage: Joi.string(),
    convenience: Joi.string(),
    description: Joi.string(),
  };
  return Joi.validate(cafe, schema);
};

const Cafe = model('Cafes', cafeSchema);

module.exports = {
  cafeSchema, validateCafe, Cafe,
};
