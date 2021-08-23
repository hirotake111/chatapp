const { v4: uuid } = require("uuid");

const func = (id) => ({ id, time: Date.now() - id });

const x = [func(1), func(1000), func(10000), func(50), func(120)];

console.log(x);
console.log(x.sort((a, b) => b.time - a.time));
