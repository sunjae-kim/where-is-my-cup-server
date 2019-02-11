const { Cafe, cafeSchema, validateCafe } = require('./cafe');
const { Tag, tagSchema, validateTag } = require('./tag');
const { User, usersSchema, validateUser } = require('./user');

module.exports = {
  models: {
    Cafe, Tag, User,
  },
  schemas: {
    cafeSchema, tagSchema, usersSchema,
  },
  validateMethods: {
    validateCafe, validateTag, validateUser,
  },
};
