import { FC, PropsWithChildren } from 'react'
import Header from './header/Header'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div>
        <Header />
        <main className='p-4'>{children}</main>
      </div>
    </>
  )
}

export default Layout
