import { describe, expect, test } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router"

import AppLayout from "~/pages/AppLayout"
import { ApplicationConfigurationProvider } from "~/providers/ApplicationConfigurationProvider"

const renderLayout = () => {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [{ index: true, element: <div>page content</div> }]
      }
    ],
    { initialEntries: ["/"] }
  )

  return render(
    <ApplicationConfigurationProvider>
      <RouterProvider router={router} />
    </ApplicationConfigurationProvider>
  )
}

describe("AppLayout", () => {
  test("renders the branded header", async () => {
    renderLayout()

    expect(await screen.findByRole("link", { name: /Task Timer/ })).toHaveAttribute("href", "/")
    expect(screen.getByRole("img", { name: "Task Timer" })).toBeInTheDocument()
  })

  test("renders the theme toggle", async () => {
    renderLayout()

    expect(await screen.findByRole("button", { name: /Switch to (light|dark) theme/ })).toBeInTheDocument()
  })

  test("renders the routed page below the header", async () => {
    renderLayout()

    expect(await screen.findByText("page content")).toBeInTheDocument()
  })

  test("has no sign-out control", async () => {
    renderLayout()
    await screen.findByText("page content")

    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument()
  })
})
