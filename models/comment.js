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
          Comment.belongsTo(models.BlogPost, {as: 'CommentOfPost'}); //comment as "postcomments" belongsto blo
          Comment.belongsTo(models.User, {as: 'Author'}); // comment has on author
      }
    },
    instanceMethods: { //This makes sure the returned JSON is
        toJson: function() { //               in correct form
            var res = this.values;
            // format JSON response correctly
            delete res.createdAt; 
            delete res.updatedAt; 
            delete res.BlogPostId;
            delete res.CommentOfPostId;
            delete res.AuthorId;
            
            return res;
        }

    }
  });
  return Comment;
};