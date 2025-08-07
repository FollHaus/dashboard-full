import {FC} from "react"
import Logo from "@/ui/header/Logo";
import LoginForm from "@/ui/header/login-form/LoginForm";
import styles from './Header.module.scss'
import Link from "next/link";

const Header: FC = () => {
    return <header className={styles.header}>
        <Logo/>
        <Link href="/" className={styles.link}> Главная </Link>
        <Link href="/products" className={styles.link}> Склад   </Link>
        <Link href="/tasks" className={styles.link}> Задачи  </Link>
        <Link href="/reports" className={styles.link}> Отчёты  </Link>
        <LoginForm/>
    </header>
}

export default Header
