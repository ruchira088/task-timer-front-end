import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"

import HomePage from "~/pages/HomePage"

describe("HomePage", () => {
  test("renders the timer", () => {
    render(<HomePage />)

    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument()
    expect(screen.getByTestId("timer-value-ss")).toHaveTextContent("00")
  })

  test("renders the build commit marker", () => {
    const { container } = render(<HomePage />)

    expect(container.querySelector(".git-hash")).toBeInTheDocument()
  })
})
