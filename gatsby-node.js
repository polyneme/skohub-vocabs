/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const jsonld = require('jsonld')
const n3 = require('n3')
const path = require('path')
const fs = require('fs')

const parser = new n3.Parser()
const writer = new n3.Writer({ format: 'N-Quads' })

const context = {
  "@context": {
    "id": "@id",
    "type": "@type",
    "@vocab": "http://www.w3.org/2004/02/skos/core#",
    "title": {
      "@id": "http://purl.org/dc/terms/title"
    },
    "prefLabel": {
      "@container": "@language"
    },
    "narrower": {
      "@container": "@set"
    }
  }
}

const frame = Object.assign({'@type': 'ConceptScheme'}, context)

exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    """
    Concept Node
    """
    type Concept implements Node @infer {
      prefLabel: Label!
      id: String!
      tree: String!
      json: String!
      narrower: [Concept]
      inScheme: ConceptScheme
      topConceptOf: ConceptScheme
    }

    """
    ConceptScheme Node
    """
    type ConceptScheme implements Node @infer {
      title: String!
      id: String!
      tree: String!
      json: String!
      hasTopConcept: [Concept]
    }

    """
    Multilingual Label
    """
    type Label implements Node @infer {
      de: String
      en: String
    }
  `
  createTypes(typeDefs)
}

exports.onCreateNode = async ({ node, loadNodeContent, actions, createContentDigest}, pluginOptions) => {

  const { createNode, createParentChildLink } = actions

  if (node.internal.mediaType === 'text/turtle') {
    const content = await loadNodeContent(node)

    parser.parse(content, (error, quad, prefixes) => {
      if (quad) {
        writer.addQuad(quad)
      } else if (prefixes) {
        writer.end((error, nquads) => {
          if (!error) {
            jsonld.fromRDF(nquads, {format: 'application/n-quads'}, (err, doc) => {
              if (err) throw err;
              jsonld.frame(doc, frame, (err, framed) => {
                if (err) throw err;
                jsonld.compact(doc, context, (err, compacted) => {
                  if (err) throw err;
                  compacted['@graph'].forEach((obj, i) => transformObject(
                    Object.assign(obj, {
                      tree: JSON.stringify(framed['@graph'][0]),
                      json: JSON.stringify(Object.assign({}, context, obj), null, 2)
                    })
                  ))
                })
              })
            })
          } else {
            console.error(error)
          }
        })
      } else if (error) {
        console.error(error)
      }
    })
  }

  function transformObject(obj) {
    const ttlNode = {
      ...obj,
      id: obj.id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(obj),
        type: obj.type,
      },
    }
    createNode(ttlNode)
    createParentChildLink({ parent: node, child: ttlNode })
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  return graphql(`
    {
      allConcept {
        edges {
          node {
            id
            prefLabel {
              de
              en
            }
            narrower {
              id
            }
            inScheme {
              id
            }
            topConceptOf {
              id
            }
            tree
            json
          }
        }
      }
      allConceptScheme {
        edges {
          node {
            title
            id
            hasTopConcept {
              id
            }
            tree
            json
          }
        }
      }
    }
`).then(result => {
  result.data.allConcept.edges.forEach(({ node }) => {
    createPage({
      path: node.id.replace("http:/", "").replace("#", "") + '.html',
      component: path.resolve(`./src/templates/Concept.js`),
      context: {
        node,
        narrower: node.narrower ? node.narrower.map(narrower => narrower.id) : []
      }
    })
    createJson(node)
  })
  result.data.allConceptScheme.edges.forEach(({ node }) => {
    createPage({
      path: node.id.replace("http:/", "").replace("#", "") + '.html',
      component: path.resolve(`./src/templates/ConceptScheme.js`),
      context: {
        node,
        hasTopConcept: node.hasTopConcept ? node.hasTopConcept.map(topConcept => topConcept.id) : []
      }
    })
    createJson(node)
  })
})}

const createJson = (node) => {
  const path = 'public' + node.id.replace("http:/", "").replace("#", "") + '.json'
  fs.writeFile(path, node.json, err => err && console.error(err))
}
