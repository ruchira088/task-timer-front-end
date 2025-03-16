import Timer from "@/components/timer/Timer"
import styles from "./page.module.scss"

export default function Home() {
  return (
    <div className={styles.page}>
      <Timer/>
    </div>
  )
}
