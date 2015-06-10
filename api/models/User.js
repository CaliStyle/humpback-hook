module.exports = {
  attributes: {
    username: {
      type: 'string',
      unique: true,
      index: true,
      notNull: true
    },
    email: {
      type: 'email',
      notNull: true,
      unique: true,
      index: true
    },
    passports: {
      collection: 'Passport',
      via: 'user'
    }
  }
}