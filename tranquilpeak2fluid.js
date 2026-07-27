const fs = require("fs");
const path = require("path");
const root = __dirname;

function ergodicMethod(path, fn) {
  let files = fs.readdirSync(path);
  files.forEach((file) => {
    let childPath = `${path}/${file}`;
    if (fs.statSync(childPath).isDirectory()) {
      ergodicMethod(childPath, fn);
    } else {
      fn && fn(childPath);
    }
  });
}
ergodicMethod(`${root}/source/_posts`, (file) => {
  if (file.match(/\.(jpg|png|jpeg)$/)) {
    console.log(path.basename(path.dirname(file)), "filepath");
    const content = fs.readFileSync(file);
    const distDirpath = `${root}/source/img/${path.basename(
      path.dirname(file)
    )}`;
    if (!fs.existsSync(distDirpath)) {
      fs.mkdirSync(distDirpath);
    }
    fs.writeFileSync(`${distDirpath}/${path.basename(file)}`, content);
  }
});
// ergodicMethod(`${root}/source/_posts`, (file) => {
//   if (file.match(/\.md$/)) {
//     console.log("reedit", file);
//     let content = fs.readFileSync(file, "utf-8");
//     content = content.replace(
//       /{%\s*image\s*center\s*clear\s*(\S+)\s*%}/g,
//       `![](/img/$1)`
//     );
//     fs.writeFileSync(file, content, "utf-8");
//   }
// });
