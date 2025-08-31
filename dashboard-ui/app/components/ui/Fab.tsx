import { forwardRef, ButtonHTMLAttributes } from 'react'
import clsx from 'classnames'
import { Plus } from 'lucide-react'

interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Fab = forwardRef<HTMLButtonElement, FabProps>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-card bg-success text-neutral-50 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-success',
        className,
      )}
      {...props}
    >
      {children ?? <Plus className="w-6 h-6" />}
    </button>
  )
})

Fab.displayName = 'Fab'

export default Fab
