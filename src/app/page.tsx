import Timer from "@/components/timer/Timer"
import styles from "./page.module.scss"
import classNames from "classnames"

export default function Home() {
  return (
    <div className={styles.page}>
      <Timer/>
      <div className={classNames(styles.hide, "git-hash")}>{process.env.NEXT_PUBLIC_GIT_HASH}</div>
    </div>
  )
}
