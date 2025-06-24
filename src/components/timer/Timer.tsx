"use client"

import React, {FC, useEffect, useState} from "react"
import styles from "./Timer.module.scss"
import classNames from "classnames"

enum TimeUnit {
  Seconds = "Seconds",
  Minutes = "Minutes",
  Hours = "Hours"
}

const TimeUnitInMs: Record<TimeUnit, number> = {
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
        const timeout: NodeJS.Timeout =
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

  const label = startTime !== undefined ? "Pause" : milliseconds === 0 ? "Start" : "Resume"

  const numValue = parseInt(inputValue)
  const isValid = !isNaN(numValue) && milliseconds + (numValue * TimeUnitInMs[timeUnit]) > 0

  return (
    <div className={styles.timer}>
      <TimerDisplay milliseconds={milliseconds} isActive={startTime !== undefined}/>
      <div className={styles.footer}>
        <div className={styles.timerButtonPanel}>
          <button onClick={toggleActive} className={classNames(styles.timerButton, styles.actionButton)}>{label}</button>
          <button onClick={reset} className={classNames(styles.timerButton, styles.resetButton)}>Reset</button>
        </div>
      </div>
      <div className={styles.addTime}>
        <button
          onClick={() => setShowAddTime(true)}
          className={classNames({[styles.hideAddSecondsInput]: showAddTime}, styles.addTimeButton)}>
          Add Time
        </button>
        <div className={classNames(styles.addTimeInput, {[styles.hideAddSecondsInput]: !showAddTime})}>
          <div className={styles.addTimeAmount}>
            <input value={inputValue}
                   onChange={(changeEvent) => setInputValue(changeEvent.target.value)}
                   className={styles.addTimeAmountInput}/>
            <TimeUnitSelector timeUnit={timeUnit} setTimeUnit={setTimeUnit}/>
          </div>
          <button
            className={classNames({[styles.addTimeInputButton]: isValid})}
            onClick={addTime}
            disabled={!isValid}>
            Add
          </button>
          <button className={styles.addTimeInputButton} onClick={hideAddTime}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export type TimeUnitSelectorProps = {
  readonly timeUnit: TimeUnit
  readonly setTimeUnit: (timeUnit: TimeUnit) => void
}

const TimeUnitSelector: FC<TimeUnitSelectorProps> = ({timeUnit, setTimeUnit}) => (
  <div className={styles.timeUnitSelector}>
    {
      Object.values(TimeUnit)
        .map(unit =>
          <label className={styles.timeUnit} key={unit}>
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

const formatInteger = (integerValue: number, minDigits: number = 2): string => {
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

const TimerDisplay: React.FC<TimerDisplayProps> =
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
      <div className={styles.timerDisplay}>
        {/* Hours */}
        <TimerDisplayUnit unit="hh" value={hours}/>

        <TimeSeparator/>

        {/* Minutes */}
        <TimerDisplayUnit unit="mm" value={minutes}/>

        <TimeSeparator/>

        {/* Seconds */}
        <TimerDisplayUnit unit="ss" value={seconds}/>

        <TimeSeparator/>

        {/* Centi-seconds */}
        <TimerDisplayUnit unit="SS" value={Math.round(milliseconds / 10)}/>
      </div>
    )
  }

export type TimerDisplayUnitProps = {
  readonly value: number
  readonly unit: string
}

const TimerDisplayUnit: FC<TimerDisplayUnitProps> = props =>
  <div className={styles.timerDisplayUnit}>
    <div className={styles.unit}>{props.unit}</div>
    <div className={styles.value}>{formatInteger(props.value, 2)}</div>
  </div>

const TimeSeparator = () =>
  <div className={styles.timeSeparator}>:</div>


export default Timer