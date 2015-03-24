"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: {type:DataTypes.STRING, allowNull:false},
    name: {type:DataTypes.STRING, allowNull:false},
    password: {type:DataTypes.STRING, allowNull:false}
  }, {
    classMethods: {
      associate: function(models) {
        // Tässä voi assosioida malleja toisiinsa
        // http://sequelize.readthedocs.org/en/latest/docs/associations/
        //
        // Tyyliin
        // User.hasMany(models.BlogPost);
          
          User.hasMany(models.Blog, {as : 'blogs' });
          models.Blog.belongsTo(User);
      }
    },
    instanceMethods: {
        toJson: function() {
            var res = this.values;
            // fromat JSON response correctly
            delete res.password;
            delete res.id;
            delete res.createdAt;
            delete res.updatedAt;
            return res;
        }
    }
  });
  return User;
};
