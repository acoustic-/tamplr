"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {type:DataTypes.STRING, allowNull:false},
    name: {type:DataTypes.STRING, allowNull:false},
    password: {type:DataTypes.STRING, 
              // hash the password   
              set: function(secret) {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(secret, salt); //,salt
              
                this.setDataValue('password', hash);
                }
              }
  }, {
    classMethods: {
      associate: function(models) {
        // Tässä voi assosioida malleja toisiinsa
        // http://sequelize.readthedocs.org/en/latest/docs/associations/
        //
        // Tyyliin
        // User.hasMany(models.BlogPost);
          
          User.belongsToMany(models.Blog, {as: 'AuthoredBlogs', through: 'BlogAuthors'}); //user is defined to some blogs?
          User.hasMany(models.BlogPost, {as: 'AuthoredPosts'}); //user has many blogpost
          User.belongsToMany(models.Blog, {as: 'FollowedBlogs', through: 'BlogFollowers'});
          User.belongsToMany(models.BlogPost, {as: 'LikedPosts', through: 'PostLikers'});
          
      }
    },
    instanceMethods: { //This makes sure the returned JSON is
        toJson: function() { //               in correct form
            var res = this.values;
            // fromat JSON response correctly
            delete res.password;
            delete res.id;
            delete res.createdAt;
            delete res.updatedAt;
            return res;
        },
        // check id password is valid
        validatePassword: function(password) {
            console.log("trying sync?");
            return bcrypt.compareSync(password, this.getDataValue('password'));
        }
    }
  });
  return User;
};
