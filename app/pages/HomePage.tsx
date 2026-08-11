import Timer from "~/components/timer/Timer"
import styles from "./HomePage.module.scss"
import { cn } from "~/lib/utils"

const HomePage = () => (
  <div className={styles.page}>
    <Timer />
    <div className={cn(styles.hide, "git-hash")}>{import.meta.env.VITE_GIT_COMMIT}</div>
  </div>
)

export default HomePage
