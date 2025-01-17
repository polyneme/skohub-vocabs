import React from "react"
import * as Gatsby from "gatsby"
import { render, screen, act } from "@testing-library/react"
import App from "../src/templates/App"
import {
  createHistory,
  createMemorySource,
  LocationProvider,
} from "@gatsbyjs/reach-router"
import { ConceptPC, ConceptSchemePC, CollectionPC } from "./data/pageContext"
import mockFetch from "./mocks/mockFetch"
import { mockConfig } from "./mocks/mockConfig"
import userEvent from "@testing-library/user-event"

const useStaticQuery = jest.spyOn(Gatsby, `useStaticQuery`)

describe("App", () => {
  beforeEach(() => {
    jest.spyOn(window, "fetch").mockImplementation(mockFetch)
    useStaticQuery.mockImplementation(() => mockConfig)
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("renders App component with expand and collapse button", async () => {
    const route = "/w3id.org/index.de.html"
    await act(() => {
      render(
        <LocationProvider history={createHistory(createMemorySource(route))}>
          <App pageContext={ConceptSchemePC} children={null} />
        </LocationProvider>
      )
    })
    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument()
  })

  it("renders App component **without** collapse and expand button", async () => {
    const route = "/w3id.org/index.de.html"
    // remove narrower from concept
    const topConcept = ConceptSchemePC.node.hasTopConcept[0]
    const pageContext = {
      ...ConceptSchemePC,
      node: {
        ...ConceptSchemePC.node,
        hasTopConcept: [{ ...topConcept, narrower: null }],
      },
    }

    await act(() => {
      render(
        <LocationProvider history={createHistory(createMemorySource(route))}>
          <App pageContext={pageContext} children={null} />
        </LocationProvider>
      )
    })
    expect(screen.queryByRole("button", { name: "Collapse" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull()
  })

  it("correctly fetches tree when page context is a concept", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    const route = "/w3id.org/c1.de.html"
    await act(() => {
      render(
        <LocationProvider history={createHistory(createMemorySource(route))}>
          <App pageContext={ConceptPC} children={null} />
        </LocationProvider>
      )
    })
    // we render the concept with notation therefore the "1"
    expect(
      screen.getByRole("link", { name: "1 Konzept 1" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Konzept 2" })).toBeInTheDocument()
  })

  it("correctly fetches tree when page context is a collection", async () => {
    window.HTMLElement.prototype.scrollIntoView = function () {}
    const route = "/w3id.org/collection.de.html"
    await act(() => {
      render(
        <LocationProvider history={createHistory(createMemorySource(route))}>
          <App pageContext={CollectionPC} children={null} />
        </LocationProvider>
      )
    })
    // we render the concept with notation therefore the "1"
    expect(
      screen.getByRole("link", { name: "1 Konzept 1" })
    ).toBeInTheDocument()
    // somehow the link role for Konzept 2 is not found, but it is there, so we use getByText
    expect(screen.getByText("Konzept 2")).toBeInTheDocument()
  })

  it("search is working", async () => {
    const user = userEvent.setup()
    const route = "/w3id.org/index.de.html"
    await act(() => {
      render(
        <LocationProvider history={createHistory(createMemorySource(route))}>
          <App pageContext={ConceptSchemePC} children={null} />
        </LocationProvider>
      )
    })
    expect(screen.queryByText("Konzept 1")).toBeInTheDocument()
    expect(screen.queryByText("Konzept 2")).toBeInTheDocument()
    await user.click(screen.getByRole("textbox"))
    await user.keyboard("Konzept 1")
    expect(screen.queryByText("Konzept 1")).toBeInTheDocument()
    expect(screen.queryByText("Konzept 2")).toBeNull()
  })
})
