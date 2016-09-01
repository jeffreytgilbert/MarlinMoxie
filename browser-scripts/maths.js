var $ = require('jquery');
var math = require('mathjs');

module.exports = {
  subOperators: function(string){
    if(string.includes("x")) {
      var newString = string.replace("x", "*");
    }
    if (string.includes("÷")) {
      newString = string.replace("÷", "/");
    }
    return newString;
  },
  getResult: function(text) {
    var firstPart = text.split('What is ')[1];
    var secondPart = firstPart.split(' ?')[0];
    var result = math.eval(subOperators(secondPart));
    return result;
  }
};
