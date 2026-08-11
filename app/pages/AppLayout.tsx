import { Link, Outlet } from "react-router"
import { ThemeToggle } from "~/components/ThemeToggle"
import smallLogo from "~/images/small-logo.svg"

const AppLayout = () => (
  <>
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link to="/" className="flex items-center gap-2 no-underline">
        <img src={smallLogo} alt="Task Timer" className="h-8 w-8" />
        <span className="text-lg font-semibold">Task Timer</span>
      </Link>
      <ThemeToggle />
    </header>
    <Outlet />
  </>
)

export default AppLayout
