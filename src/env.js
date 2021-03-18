const path = require("path")
const nunjucks = require("nunjucks")
const Template = require("./template")
const { mkdirP } = require("./utils")


class Env {
  #context // Global context, used by all templates
  #info // Info to print out when compiling
  #templates // List of templates
  #dest // Destination folder
  #nunjucksEnv

  constructor({ context, templatesPath, dest } = { context: {}, templatesPath: ".", dest: "html" }) {
    this.#context = context
    this.#info = [ "Preparing templates" ]
    this.#templates = []
    this.#dest = dest
    this.#nunjucksEnv = nunjucks.configure(templatesPath)
  }

  addInfo(f) {
    this.#info.push(f(this.#context))
  }

  addTemplate(template, dest, options = {}) {
    const dftOptions = {
      context: {},
      useGlobalContext: true,
      skipIf: _ => false
    }
    let { context, useGlobalContext, skipIf } = { ...dftOptions, ...options }
    let tplContext = useGlobalContext ? { ...this.#context, ...context } : context
    if (!skipIf(tplContext)) {
      this.#templates.push(new Template(template, path.join(this.#dest, dest), tplContext))
    }
  }

  async run() {
    await mkdirP(this.#dest)

    this.#info.forEach(ln => console.log(ln))
    console.log("")

    return Template.saveAll(this.#templates, this.#nunjucksEnv)
      .catch((err) => {
        console.error(err)
        process.exit(1)
      })
      .then(() => {
        console.log("")
        console.log("Templates compiled!")
      })
  }
}

module.exports = Env
