import { forwardRef, InputHTMLAttributes } from 'react'
import clsx from 'classnames'
import { Search } from 'lucide-react'

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-800" />
      <input
        ref={ref}
        type="search"
        className={clsx(
          'h-10 w-full rounded-xl border border-neutral-300 bg-neutral-100 pl-9 pr-3 placeholder:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300',
          className,
        )}
        {...props}
      />
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
