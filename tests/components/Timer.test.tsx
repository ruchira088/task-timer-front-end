import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"

import Timer, { formatInteger, TimeUnit, TimeUnitInMs } from "~/components/timer/Timer"

const displayed = () =>
  ["hh", "mm", "ss", "SS"].map(unit => screen.getByTestId(`timer-value-${unit}`).textContent).join(":")

const button = (name: string) => screen.getByRole("button", { name })

const advance = (milliseconds: number) => act(() => {
  vi.advanceTimersByTime(milliseconds)
})

describe("formatInteger", () => {
  test("pads to the requested number of digits", () => {
    expect(formatInteger(0)).toBe("00")
    expect(formatInteger(7)).toBe("07")
    expect(formatInteger(59)).toBe("59")
    expect(formatInteger(7, 3)).toBe("007")
  })

  test("leaves values longer than minDigits untouched", () => {
    expect(formatInteger(123)).toBe("123")
  })

  test("rejects negative and non-integer values", () => {
    expect(() => formatInteger(-1)).toThrow(/not a positive integer/)
    expect(() => formatInteger(1.5)).toThrow(/not a positive integer/)
  })
})

describe("TimeUnitInMs", () => {
  test("maps each unit to its millisecond value", () => {
    expect(TimeUnitInMs[TimeUnit.Seconds]).toBe(1_000)
    expect(TimeUnitInMs[TimeUnit.Minutes]).toBe(60_000)
    expect(TimeUnitInMs[TimeUnit.Hours]).toBe(3_600_000)
  })
})

describe("Timer", () => {
  test("starts at zero with a Start button", () => {
    render(<Timer />)

    expect(displayed()).toBe("00:00:00:00")
    expect(button("Start")).toBeInTheDocument()
    expect(button("Reset")).toBeInTheDocument()
  })

  test("disables Reset until there is something to reset", () => {
    render(<Timer />)

    expect(button("Reset")).toBeDisabled()

    fireEvent.click(button("Add time"))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "5" } })
    fireEvent.click(button("Add"))

    expect(button("Reset")).toBeEnabled()
  })

  test("exposes the elapsed time to assistive tech without announcing every tick", () => {
    render(<Timer />)

    expect(screen.getByRole("timer")).toHaveAttribute("aria-label", "00:00 elapsed")
    expect(screen.getByRole("timer")).not.toHaveAttribute("aria-live")
  })

  test("reports Paused once time has accrued", () => {
    render(<Timer />)

    expect(screen.queryByText("Paused")).not.toBeInTheDocument()

    fireEvent.click(button("Add time"))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "5" } })
    fireEvent.click(button("Add"))

    expect(screen.getByText("Paused")).toBeInTheDocument()
  })

  test("adds time in the selected unit", () => {
    render(<Timer />)

    fireEvent.click(button("Add time"))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "90" } })
    fireEvent.click(screen.getByRole("radio", { name: TimeUnit.Minutes }))
    fireEvent.click(button("Add"))

    expect(displayed()).toBe("01:30:00:00")
  })

  test("defaults to adding seconds", () => {
    render(<Timer />)

    fireEvent.click(button("Add time"))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "45" } })
    fireEvent.click(button("Add"))

    expect(displayed()).toBe("00:00:45:00")
  })

  test("keeps the Add button disabled until the input is a positive number", () => {
    render(<Timer />)

    fireEvent.click(button("Add time"))
    expect(button("Add")).toBeDisabled()

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } })
    expect(button("Add")).toBeDisabled()

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "5" } })
    expect(button("Add")).toBeEnabled()
  })

  test("Cancel discards the entered amount", () => {
    render(<Timer />)

    fireEvent.click(button("Add time"))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "45" } })
    fireEvent.click(button("Cancel"))

    expect(displayed()).toBe("00:00:00:00")

    fireEvent.click(button("Add time"))
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  describe("while running", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test("counts up and offers Pause", () => {
      render(<Timer />)

      fireEvent.click(button("Start"))
      expect(button("Pause")).toBeInTheDocument()

      advance(2_500)

      expect(displayed()).toBe("00:00:02:50")
    })

    test("holds the elapsed time when paused and offers Resume", () => {
      render(<Timer />)

      fireEvent.click(button("Start"))
      advance(3_000)
      fireEvent.click(button("Pause"))

      const paused = displayed()
      advance(5_000)

      expect(displayed()).toBe(paused)
      expect(button("Resume")).toBeInTheDocument()
    })

    test("resumes from the paused time", () => {
      render(<Timer />)

      fireEvent.click(button("Start"))
      advance(3_000)
      fireEvent.click(button("Pause"))
      fireEvent.click(button("Resume"))
      advance(2_000)

      expect(displayed()).toBe("00:00:05:00")
    })

    test("Reset clears the elapsed time", () => {
      render(<Timer />)

      fireEvent.click(button("Start"))
      advance(4_000)
      fireEvent.click(button("Reset"))

      expect(displayed()).toBe("00:00:00:00")
      expect(button("Start")).toBeInTheDocument()
    })

    test("counts added time alongside elapsed time", () => {
      render(<Timer />)

      fireEvent.click(button("Add time"))
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "10" } })
      fireEvent.click(button("Add"))

      // Added time counts as elapsed time, so the action button offers Resume.
      fireEvent.click(button("Resume"))
      advance(5_000)

      expect(displayed()).toBe("00:00:15:00")
    })

    test("reflects the elapsed time in the document title", () => {
      render(<Timer />)

      fireEvent.click(button("Start"))
      advance(65_000)

      expect(document.title).toMatch(/01:05/)

      fireEvent.click(button("Pause"))
      expect(document.title).toMatch(/\(Paused\)/)
    })
  })
})
