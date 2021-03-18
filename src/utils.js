const fs = require("fs").promises
const path = require("path")


const mkdirP = async dir =>
  fs.stat(dir)
    .catch(_ => fs.mkdir(dir, { recursive: true }))
    .then(_ => dir)

exports.mkdirP = mkdirP


const saveFile = async ({ name, content }) => {
  await mkdirP(path.dirname(name))
  await fs.writeFile(name, content)

  return name
}

exports.saveFile = saveFile


const lsFiles = async (dir, ext) =>
  fs.readdir(dir).then(files => files.filter(name => name.endsWith("." + ext)))

exports.lsFiles = lsFiles


const copyR = async (source, dest) => {
  stat = await fs.stat(source)

  if (stat.isDirectory()) {
    await mkdirP(dest)
    return fs.readdir(source)
      .then(files =>
        Promise.all(files.map(child =>
          copyR(path.join(source, child), path.join(dest, child))
        ))
      )
  }
  else {
    return fs.copyFile(source, dest)
  }
}

exports.copyR = copyR
