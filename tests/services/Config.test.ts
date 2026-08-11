import { afterEach, describe, expect, test, vi } from "vitest"

import { Environment, getEnvironment } from "~/services/Config"

const originalLocation = window.location

const withHost = (host: string) => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...originalLocation, host }
  })
}

describe("getEnvironment", () => {
  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation
    })
  })

  test("maps the production host to Production", () => {
    withHost("timer.ruchij.com")
    expect(getEnvironment()).toBe(Environment.Production)
  })

  test("maps the staging host to Staging", () => {
    withHost("staging.timer.ruchij.com")
    expect(getEnvironment()).toBe(Environment.Staging)
  })

  test("falls back to Development for unknown hosts", () => {
    withHost("localhost:5173")
    expect(getEnvironment()).toBe(Environment.Development)
  })

  test("treats per-branch subdomains as Development", () => {
    withHost("my-branch.timer.ruchij.com")
    expect(getEnvironment()).toBe(Environment.Development)
  })
})
