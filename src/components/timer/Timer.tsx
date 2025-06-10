"use client"

import React, {FC, useEffect, useState} from "react"
import styles from "./Timer.module.scss"
import classNames from "classnames"

const Timer = () => {
  const [startTime, setStartTime] = useState<number | undefined>(undefined)
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [addonMilliseconds, setAddonMilliseconds] = useState<number>(0)
  const [showAddSeconds, setShowAddSeconds] = useState<boolean>(false)
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
      setAddonMilliseconds(addonMilliseconds => addonMilliseconds + time * 1000)
    }

    setInputValue("")
    setShowAddSeconds(false)
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

  const cancelAddSeconds = () => {
    setShowAddSeconds(false)
    setInputValue("")
  }

  const label = startTime !== undefined ? "Pause" : milliseconds === 0 ? "Start" : "Resume"

  return (
    <div className={styles.timer}>
      <TimerDisplay milliseconds={milliseconds}/>
      <div className={styles.footer}>
        <div className={styles.timerButtonPanel}>
          <button onClick={toggleActive} className={classNames(styles.timerButton, styles.actionButton)}>{label}</button>
          <button onClick={reset} className={classNames(styles.timerButton, styles.resetButton)}>Reset</button>
        </div>
      </div>
      <div className={styles.addTime}>
        <button
          onClick={() => setShowAddSeconds(true)}
          className={classNames({[styles.hideAddSecondsInput]: showAddSeconds})}>
          Add Time
        </button>
        <div className={classNames(styles.addTimeInput, {[styles.hideAddSecondsInput]: !showAddSeconds})}>
          <input value={inputValue} onChange={(changeEvent) => setInputValue(changeEvent.target.value)}/>
          <button onClick={addTime} disabled={isNaN(parseInt(inputValue))}>
            Add Seconds
          </button>
          <button onClick={cancelAddSeconds}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const MILLISECONDS_IN_MINUTE = 60 * 1000
const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE

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
  milliseconds: number
}

const TimerDisplay: React.FC<TimerDisplayProps> =
  props => {
    const hours = Math.floor(props.milliseconds / MILLISECONDS_IN_HOUR)
    const minutes = Math.floor(props.milliseconds % MILLISECONDS_IN_HOUR / MILLISECONDS_IN_MINUTE)
    const seconds = Math.floor(props.milliseconds % MILLISECONDS_IN_MINUTE / 1000)
    const milliseconds = props.milliseconds % 1000

    const title = (hours > 0 ? [hours] : []).concat([minutes, seconds])
      .map(value => formatInteger(value, 2)).join(":")

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