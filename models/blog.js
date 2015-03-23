"use strict";

module.exports = function(sequelize, DataTypes) {
  var Blog = sequelize.define("Blog", {
    id: DataTypes.STRING,
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // Tässä voi assosioida malleja toisiinsa
        // http://sequelize.readthedocs.org/en/latest/docs/associations/
        //
        // Tyyliin
        // User.hasMany(models.BlogPost);
           Blog.belongsTo(models.User);
      }
    }
  });

  return Blog;
};