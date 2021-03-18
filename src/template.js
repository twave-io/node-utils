const fs = require("fs").promises
const path = require("path")
const { saveFile } = require("./utils")


class Template {
  #source
  #dest
  #context

  get dest() {
    return this.#dest
  }

  constructor(source, dest, context = {}) {
    this.#source = source
    this.#dest = dest
    this.#context = context
  }

  save(env) {
    let promise = new Promise((resolve, reject) => {
      env.render(this.#source, this.#context, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })

    return promise.then((res) => saveFile({ name: this.#dest, content: res }))
  }

  static saveAll(files, env) {
    return Promise.all(files.map(file =>
      file.save(env)
      .then(() =>
        console.log(`> ${file.dest}`)
      )
    ))
  }
}

module.exports = Template
