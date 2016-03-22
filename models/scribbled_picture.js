"use strict";

module.exports = function(sequelize, DataTypes) {
  var Scribbled_picture = sequelize.define("Scribbled_picture", {
    scribbled_id: {type:DataTypes.STRING, allowNull:false},
    scribbled_img: {type:DataTypes.STRING, allowNull:false}
  }, {
    classMethods: {
      associate: function(models) {
          Scribbled_picture.belongsTo(models.User, {as: 'Scribbler'}); //comment as "postcomments" belongsto blo
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
  return Scribbled_picture;
};
