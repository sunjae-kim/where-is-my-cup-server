const { Schema, model } = require('mongoose');
const Joi = require('joi');

const tagSchema = new Schema({
  spaceL: { type: Number, default: 0 },
  spaceS: { type: Number, default: 0 },
  professional: { type: Number, default: 0 },
  menuVariety: { type: Number, default: 0 },
  menuSimple: { type: Number, default: 0 },
  kindness: { type: Number, default: 0 },
  workingSpace: { type: Number, default: 0 },
  dessertVariety: { type: Number, default: 0 },
  nonCaffeine: { type: Number, default: 0 },
  calmMusic: { type: Number, default: 0 },
  hipMusic: { type: Number, default: 0 },
  photoZone: { type: Number, default: 0 },
});

const validateTag = (tag) => {
  const schema = {
    spaceL: Joi.boolean(),
    spaceS: Joi.boolean(),
    professional: Joi.boolean(),
    menuVariety: Joi.boolean(),
    menuSimple: Joi.boolean(),
    kindness: Joi.boolean(),
    workingSpace: Joi.boolean(),
    dessertVariety: Joi.boolean(),
    nonCaffeine: Joi.boolean(),
    calmMusic: Joi.boolean(),
    hipMusic: Joi.boolean(),
    photoZone: Joi.boolean(),
  };
  return Joi.validate(tag, schema);
};

const Tag = model('Tag', tagSchema);

module.exports = {
  tagSchema, validateTag, Tag,
};
