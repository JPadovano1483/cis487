const charCounter = (search) => {
  return str => {
    let count = 0;
    for (const c of str) {
      if (c == search) count++; 
    }
    return count;
  }
}

let countBs = charCounter("B");
console.log(countBs("BBC"));
let countKs = charCounter("k");
console.log(countKs("kakkerlak"));
