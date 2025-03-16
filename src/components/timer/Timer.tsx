"use client"

import React, {useEffect, useState} from "react"
import styles from "./Timer.module.scss"

const Timer = () => {
  const [startTime, setStartTime] = useState<number | undefined>(undefined)
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [addonMilliseconds, setAddonMilliseconds] = useState<number>(0)
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

  const label = startTime !== undefined ? "Pause" : milliseconds === 0 ? "Start" : "Resume"

  return (
    <div className={styles.timer}>
      <TimerDisplay milliseconds={milliseconds}/>
      <div className={styles.timerButtonPanel}>
        <button onClick={toggleActive} className={styles.timerButton}>{label}</button>
        <button onClick={reset} className={styles.timerButton}>Reset</button>
      </div>
      <div className={styles.addSeconds}>
        <input value={inputValue} onChange={(changeEvent) => setInputValue(changeEvent.target.value)}/>
        <button onClick={addTime}>Add Seconds</button>
      </div>
    </div>
  )
}

type TimerDisplayProps = {
  milliseconds: number
}

const MILLISECONDS_IN_MINUTE = 60 * 1000
const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE

const formatInteger = (integerValue: number, minDigits: number): string => {
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

const TimerDisplay: React.FC<TimerDisplayProps> =
  (props: TimerDisplayProps) => {
    const hours = Math.floor(props.milliseconds / MILLISECONDS_IN_HOUR)
    const minutes = Math.floor(props.milliseconds % MILLISECONDS_IN_HOUR / MILLISECONDS_IN_MINUTE)
    const seconds = Math.floor(props.milliseconds % MILLISECONDS_IN_MINUTE / 1000)
    const milliseconds = props.milliseconds % 1000

    return (
      <div className={styles.timerDisplay}>
        {/* Hours */}
        <div className={styles.timerDigits}>{formatInteger(hours, 2)}</div>

        {/* Minutes */}
        <div className={styles.timerDigits}>{formatInteger(minutes, 2)}</div>

        {/* Seconds */}
        <div className={styles.timerDigits}>{formatInteger(seconds, 2)}</div>

        {/* Centi-seconds */}
        <div className={styles.timerDigits}>{formatInteger(Math.round(milliseconds / 10), 2)}</div>
      </div>
    )
  }



export default Timer