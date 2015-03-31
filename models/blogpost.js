"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var BlogPost = sequelize.define("BlogPost", {
    id: {type:DataTypes.INTEGER, allowNull:false},
    title: {type:DataTypes.STRING, allowNull:false},
    text: {type:DataTypes.STRING, allowNull:false},
    author: {type:DataTypes.STRING, allowNull:false}
  }, {
    classMethods: {
      associate: function(models) {
        // Tässä voi assosioida malleja toisiinsa
        // http://sequelize.readthedocs.org/en/latest/docs/associations/
        //
        // Tyyliin
        // User.hasMany(models.BlogPost);
          
          //BlogPost.belongsToMany(models.Blog, {as: 'AuthoredPosts'}); 
          BlogPost.hasOne(models.User, {as: 'AuthoredPosts'}); //user has many blogpost
      }
    },
    instanceMethods: { //This makes sure the returned JSON is
        toJson: function() { //               in correct form
            var res = this.values;
            // format JSON response correctly
            delete res.createdAt; 
            delete res.updatedAt;
            return res;
        }

    }
  });
  return BlogPost;
};
