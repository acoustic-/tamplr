"use strict";

module.exports = function(sequelize, DataTypes) {
  var Blog = sequelize.define("Blog", {
    name: {type:DataTypes.STRING, allowNull:false}
  }, {
    classMethods: {
      associate: function(models) {
        // Tässä voi assosioida malleja toisiinsa
        // http://sequelize.readthedocs.org/en/latest/docs/associations/
        //
        // Tyyliin
        // User.hasMany(models.BlogPost);
          
          Blog.belongsToMany(models.User, {as: 'Authors', through: 'BlogAuthors'});
          Blog.belongsToMany(models.User, {as: 'Followers', through: 'BlogFollowers'});
          Blog.hasMany(models.BlogPost, {as: 'Posts'});
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
  
    return Blog;
};
