// api.js

function addNumbers(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both inputs must be numbers');
    }
    return a + b;
  }
  
  module.exports = {
    addNumbers,
  };
  