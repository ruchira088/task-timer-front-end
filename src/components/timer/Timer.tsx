"use client"

import React, {useEffect, useState} from "react"

const Timer = () => {
  const [milliseconds, setMilliseconds] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [active, setActive] = useState<boolean>(false)

  useEffect(() => {
      if (active) {
        const timeout: NodeJS.Timeout =
          setInterval(() => setMilliseconds(milliseconds => milliseconds + 100), 100)
        return () => clearInterval(timeout)
      }
    },
    [active]
  )

  const addTime = () => {
    const time: number = parseInt(inputValue)

    if (!isNaN(time)) {
      setMilliseconds(milliseconds => milliseconds + time)
    }

    setInputValue("")
  }

  const reset = () => {
    setActive(false)
    setMilliseconds(0)
  }


  return <div>
    {milliseconds / 100}
    <button onClick={() => setActive(active => !active)}>{active ? "Pause" : "Start"}</button>
    <button onClick={reset}>Reset</button>
    <input value={inputValue} onChange={(changeEvent) => setInputValue(changeEvent.target.value)} />
    <button onClick={addTime}>Add</button>
  </div>

}

export default Timer