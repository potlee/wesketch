Array.prototype.last = function() {
  return this[this.length - 1];
};

Array.prototype.flatten = function() {
  return this.reduce(function(a, b) {
    return a.concat(b);
  });
};
