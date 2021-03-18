const path = require("path")
const fs = require("fs").promises
const Env = require("../src/env")
const dest = path.join(__dirname, "tmp")

const escapeTpl = (tpl) => tpl.replace(/\n/g, "\\n")

const assertFile = (fileName, content) =>
  fs.readFile(path.join(__dirname, "tmp", fileName), { encoding: "utf8" })
    .then(fileContent => fileContent.slice(0, -1))
    .then(fileContent => {
      if (fileContent == content) {
        return `${fileName} ok`
      }
      else {
        return `${fileName} failed. Expected ${escapeTpl(content)}, got ${escapeTpl(fileContent)}`
      }
    })
    .catch(err => {
      return `Error ${err}`
    })

const assertNotFile = (fileName) =>
  fs.stat(fileName)
    .then(_ => `Fail. ${fileName} exists`)
    .catch(_ => `${fileName} ok`)

const env = new Env({
  context: {
    title: "Test"
  },
  templatesPath: __dirname,
  dest: dest
})

env.addInfo(({ title }) => `${title} works`)

env.addTemplate(
  "test.html",
  "test-1.html",
  { context: { number: 1 } }
)

env.addTemplate(
  "test.html",
  "test-2.html",
  { context: { title: "Test 2" } }
)

env.addTemplate(
  "test.html",
  "test-3.html",
  { useGlobalContext: false }
)

env.addTemplate(
  "test.html",
  "test-4.html",
  { skipIf: ({ title }) => title == "Test" }
)

env.run().then(_ =>
  Promise.all([
    assertFile("test-1.html", "<h1>Test</h1>\n<p>1</p>"),
    assertFile("test-2.html", "<h1>Test 2</h1>\n<p></p>"),
    assertFile("test-3.html", "<h1></h1>\n<p></p>"),
    assertNotFile("tmp/test-4.html")
  ])
  .then(lns => lns.forEach(ln => console.log(ln)))
  .then(_ => fs.rmdir(dest, { recursive: true }))
)
