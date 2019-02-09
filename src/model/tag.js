const { Schema, model } = require('mongoose');
const Joi = require('joi');

const tagSchema = new Schema({
  spaceL: { type: Number, default: 0 },
  spaceM: { type: Number, default: 0 },
  spaceS: { type: Number, default: 0 },
  professional: { type: Number, default: 0 },
  menuVariety: { type: Number, default: 0 },
  menuSimple: { type: Number, default: 0 },
  nonCaffeine: { type: Number, default: 0 },
  juice: { type: Number, default: 0 },
  kindness: { type: Number, default: 0 },
  dessertVariety: { type: Number, default: 0 },
  dessertSimple: { type: Number, default: 0 },
});

const validateCafe = (tag) => {
  const schema = {
    spaceL: Joi.number(),
    spaceM: Joi.number(),
    spaceS: Joi.number(),
    professional: Joi.number(),
    menuVariety: Joi.number(),
    menuSimple: Joi.number(),
    nonCaffeine: Joi.number(),
    juice: Joi.number(),
    kindness: Joi.number(),
    dessertVariety: Joi.number(),
    dessertSimple: Joi.number(),
  };
  return Joi.validate(tag, schema);
};

const Tags = model('Tag', tagSchema);

module.exports = {
  tagSchema, validateCafe, Tags,
};
