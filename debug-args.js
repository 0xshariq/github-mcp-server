#!/usr/bin/env node
console.log('process.argv[0]:', process.argv[0]);
console.log('process.argv[1]:', process.argv[1]);
console.log('process.env._:', process.env._);
console.log('path.basename(process.argv[1]):', require('path').basename(process.argv[1]));
console.log('All args:', process.argv);