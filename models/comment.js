"use strict";

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {
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
          Comment.hasOne(models.BlogPost, {as: 'CommentOfPost'}); //comment as "postcomments" belongsto blo
          Comment.hasOne(models.User, {as: 'Author'}); // comment has on author
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
  return Comment;
};