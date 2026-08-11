import { Link, Outlet } from "react-router"
import { Timer as TimerIcon } from "lucide-react"
import { ThemeToggle } from "~/components/ThemeToggle"

const AppLayout = () => (
  <>
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link to="/" className="flex items-center gap-2 no-underline">
        {/* Decorative — the adjacent text already names the link. */}
        <TimerIcon className="h-8 w-8" aria-hidden="true" />
        <span className="text-lg font-semibold">Task Timer</span>
      </Link>
      <ThemeToggle />
    </header>
    <Outlet />
  </>
)

export default AppLayout
