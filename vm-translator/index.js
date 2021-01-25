const fs = require('fs');
const readline = require('readline');
const Translator = require('./translator');

// 0: node, 1: current file
const source = process.argv[2];

if (!source) {
  throw Error('you should give me input file!');
}

fs.stat(source, (err) => {
  if (err) {
    throw err;
  }

  console.log(`Reading file ${source}`);
  readSource(source);
});

function readSource() {
  const target = `${source.substr(0, source.lastIndexOf('.'))}.asm`;
  const sourceStream = fs.createReadStream(source);
  const targetStream = fs.createWriteStream(target);
  let lineIndex = 0;

  readline.createInterface({
    input: sourceStream,
    crlfDelay: Infinity,
  }).on('line', (line) => {
    lineIndex++;
    line = lineSanitize(line);
    if (line === null) return;

    try {
      const asmLine = Translator.translate(line);
      targetStream.write(`// line: ${lineIndex}\n${asmLine}\n`);
    } catch (err) {
      throw new Error(`${err.message} at line ${lineIndex}`);
    }
  }).on('close', () => {
    console.log(`Wrote to ${target}`);
  });
}

function lineSanitize(line) {
  line = line.toString().trim();
  return line === '' || line.startsWith('//') ? null : line;
}
