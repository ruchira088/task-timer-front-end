import { type FC, useEffect, useState } from "react"
import { Pause, Play, Plus, RotateCcw } from "lucide-react"
import styles from "./Timer.module.scss"
import { cn } from "~/lib/utils"

export enum TimeUnit {
  Seconds = "Seconds",
  Minutes = "Minutes",
  Hours = "Hours"
}

export const TimeUnitInMs: Record<TimeUnit, number> = {
  [TimeUnit.Seconds]: 1000,
  [TimeUnit.Minutes]: 60 * 1000,
  [TimeUnit.Hours]: 60 * 60 * 1000
}

const Timer = () => {
  const [startTime, setStartTime] = useState<number | undefined>(undefined)
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [addonMilliseconds, setAddonMilliseconds] = useState<number>(0)
  const [timeUnit, setTimeUnit] = useState<TimeUnit>(TimeUnit.Seconds)
  const [showAddTime, setShowAddTime] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>("")

  useEffect(() => {
      if (startTime !== undefined) {
        const timeout: ReturnType<typeof setInterval> =
          setInterval(
            () => {
              const timeElapsed = Date.now() - startTime
              setMilliseconds(timeElapsed - timeElapsed % 10 + addonMilliseconds)
            },
            10
          )
        return () => clearInterval(timeout)
      } else {
        setMilliseconds(addonMilliseconds)
      }
    },
    [startTime, addonMilliseconds]
  )

  const addTime = () => {
    const time: number = parseInt(inputValue)

    if (!isNaN(time)) {
      setAddonMilliseconds(addonMilliseconds => addonMilliseconds + (time * TimeUnitInMs[timeUnit]))
    }

    setInputValue("")
    setShowAddTime(false)
  }

  const reset = () => {
    setAddonMilliseconds(0)
    setStartTime(undefined)
    setMilliseconds(0)
  }

  const toggleActive = () => {
    if (startTime === undefined) {
      setStartTime(Date.now())
    } else {
      setAddonMilliseconds(milliseconds)
      setStartTime(undefined)
    }
  }

  const hideAddTime = () => {
    setShowAddTime(false)
    setInputValue("")
  }

  const isRunning = startTime !== undefined
  const label = isRunning ? "Pause" : milliseconds === 0 ? "Start" : "Resume"
  const ActionIcon = isRunning ? Pause : Play

  const numValue = parseInt(inputValue)
  const isValid = !isNaN(numValue) && milliseconds + (numValue * TimeUnitInMs[timeUnit]) > 0

  return (
    <div className={styles.timer}>
      <TimerDisplay milliseconds={milliseconds} isActive={isRunning}/>

      <Status isRunning={isRunning} milliseconds={milliseconds}/>

      <div className={styles.controls}>
        <button onClick={toggleActive} className={cn(styles.control, styles.primary)}>
          <ActionIcon aria-hidden="true"/>
          {label}
        </button>
        <button onClick={reset} className={cn(styles.control, styles.ghost)} disabled={milliseconds === 0}>
          <RotateCcw aria-hidden="true"/>
          Reset
        </button>
      </div>

      {
        showAddTime
          ? (
            <div className={styles.addTimePanel}>
              <div className={styles.addTimeRow}>
                <label className={styles.amountLabel} htmlFor="add-time-amount">
                  Amount
                  <input
                    id="add-time-amount"
                    value={inputValue}
                    name="amount"
                    inputMode="numeric"
                    autoFocus
                    onChange={changeEvent => setInputValue(changeEvent.target.value)}
                    className={styles.amountInput}/>
                </label>
                <TimeUnitSelector timeUnit={timeUnit} setTimeUnit={setTimeUnit}/>
              </div>
              <div className={styles.addTimeActions}>
                <button className={cn(styles.control, styles.ghost)} onClick={hideAddTime}>
                  Cancel
                </button>
                <button className={cn(styles.control, styles.primary)} onClick={addTime} disabled={!isValid}>
                  Add
                </button>
              </div>
            </div>
          )
          : (
            <button onClick={() => setShowAddTime(true)} className={cn(styles.control, styles.quiet)}>
              <Plus aria-hidden="true"/>
              Add time
            </button>
          )
      }
    </div>
  )
}

type StatusProps = {
  readonly isRunning: boolean
  readonly milliseconds: number
}

const Status: FC<StatusProps> = ({isRunning, milliseconds}) => {
  if (!isRunning && milliseconds === 0) {
    return <p className={styles.status}>&nbsp;</p>
  }

  return (
    <p className={cn(styles.status, isRunning && styles.statusLive)}>
      <span className={styles.statusDot} aria-hidden="true"/>
      {isRunning ? "Running" : "Paused"}
    </p>
  )
}

export type TimeUnitSelectorProps = {
  readonly timeUnit: TimeUnit
  readonly setTimeUnit: (timeUnit: TimeUnit) => void
}

const TimeUnitSelector: FC<TimeUnitSelectorProps> = ({timeUnit, setTimeUnit}) => (
  <div className={styles.timeUnitSelector} role="radiogroup" aria-label="Unit">
    {
      Object.values(TimeUnit)
        .map(unit =>
          <label className={cn(styles.timeUnit, timeUnit === unit && styles.timeUnitSelected)} key={unit}>
            <input
              className={styles.timeUnitInput}
              type="radio"
              name="unit"
              value={unit}
              onChange={() => setTimeUnit(unit)}
              checked={timeUnit === unit}/>
            {unit}
          </label>
        )
    }
  </div>
)

export const formatInteger = (integerValue: number, minDigits: number = 2): string => {
  const isInteger = Math.round(integerValue) - integerValue === 0
  const isPositive = integerValue >= 0

  if (!isInteger || !isPositive) {
    throw new Error(`${integerValue} is not a positive integer`)
  } else {
    const stringValue = String(integerValue)

    if (stringValue.length < minDigits) {
      return repeat(() => "0", minDigits - stringValue.length).join("") + stringValue
    } else {
      return stringValue
    }
  }
}

function repeat<T>(generator: () => T, count: number): T[] {
  if (count <= 0)  {
    return []
  } else {
    return repeat(generator, count - 1).concat([generator()])
  }
}

type TimerDisplayProps = {
  readonly milliseconds: number
  readonly isActive: boolean
}

const TimerDisplay: FC<TimerDisplayProps> =
  props => {
    const hours = Math.floor(props.milliseconds / TimeUnitInMs[TimeUnit.Hours])
    const minutes = Math.floor((props.milliseconds % TimeUnitInMs[TimeUnit.Hours]) / TimeUnitInMs[TimeUnit.Minutes])
    const seconds = Math.floor((props.milliseconds % TimeUnitInMs[TimeUnit.Minutes]) / TimeUnitInMs[TimeUnit.Seconds])
    const milliseconds = props.milliseconds % TimeUnitInMs[TimeUnit.Seconds]

    const title = (hours > 0 ? [hours] : []).concat([minutes, seconds])
      .map(value => formatInteger(value, 2)).join(":")

    const isPaused = !props.isActive && props.milliseconds > 0

    useEffect(() => {
      document.title = `${title} ${isPaused ? " (Paused)" : ""}`
    }, [title, isPaused])

    return (
      // A two-row grid: every numeral sits on one baseline and every label on
      // the next, so the display reads as a single instrument rather than four
      // stacked columns.
      <div
        className={cn(styles.display, props.isActive && styles.displayLive)}
        role="timer"
        aria-label={`${title} elapsed`}>
        <TimerDisplayUnit unit="hh" label="Hrs" value={hours}/>
        <TimeSeparator/>
        <TimerDisplayUnit unit="mm" label="Min" value={minutes}/>
        <TimeSeparator/>
        <TimerDisplayUnit unit="ss" label="Sec" value={seconds}/>

        {/* Centiseconds are the sub-register — smaller and the only saturated
            colour, so the fastest-moving digits don't lead the composition. */}
        <span className={cn(styles.value, styles.subValue)} data-testid="timer-value-SS">
          {formatInteger(Math.round(milliseconds / 10), 2)}
        </span>
      </div>
    )
  }

export type TimerDisplayUnitProps = {
  readonly value: number
  readonly unit: string
  readonly label: string
}

// Each of these contributes two cells to the display grid — a numeral on the
// value row and its label on the row beneath — so they must be fragments, not
// wrapper elements.
const TimerDisplayUnit: FC<TimerDisplayUnitProps> = props =>
  <>
    <span className={styles.value} data-testid={`timer-value-${props.unit}`}>{formatInteger(props.value, 2)}</span>
    <span className={styles.unitLabel}>{props.label}</span>
  </>

const TimeSeparator = () =>
  <>
    <span className={styles.timeSeparator} aria-hidden="true">:</span>
    <span aria-hidden="true"/>
  </>

export default Timer
