/** @type {import('tailwindcss').Config} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('tailwindcss/plugin')

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {fontFamily} = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './ui/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"IBM Plex Sans"', ...fontFamily.sans],
                cnbold: ['"CNBold"', ...fontFamily.sans],
                mono: ['"IBM Plex Mono"', ...fontFamily.mono],
            },

            colors: {
                // НЕЙТРАЛЬНЫЕ ЦВЕТА — основа в оттенках слоновой кости
                neutral: {
                    50: '#fffff8',   // Чистый ivory с легким теплым оттенком
                    100: '#fcfcf5',  // Очень светлый ivory
                    200: '#f8f8ef',  // Светлый фон для карточек
                    300: '#f3f3e8',  // Мягкий ivory для модальных окон
                    400: '#eeeade',  // Теплый ivory для разделителей
                    500: '#e5e0d5',  // Основной цвет контейнеров
                    600: '#d2cdc0',  // Для контрастных границ
                    700: '#b5b0a2',  // Тени и второстепенные элементы
                    800: '#8a8578',  // Основной текст
                    900: '#5a564c',  // Акцентный текст
                    950: '#2a2822',  // Для темных фонов
                },

                // ПЕРВИЧНЫЙ ЦВЕТ — теплый акцент (под слоновую кость)
                primary: {
                    500: '#c8b08d',  // Основной - бежево-золотистый
                    400: '#d8c4a8',  // Светлее для hover
                    300: '#e8dcc8',  // Подложки
                    200: '#f0e9dc',  // Мягкие акценты
                    100: '#f8f4ec',  // Фоны
                },

                // ВТОРИЧНЫЙ ЦВЕТ — дополнительные теплые оттенки
                secondary: {
                    50: '#f9f7f2',   // Светлый ivory
                    100: '#f1ede4',  // Фон
                    200: '#e6e0d4',  // Карточки
                    300: '#d4cdbe',  // Границы
                    400: '#b8b09e',  // Второстепенный текст
                    500: '#9c9480',  // Кнопки
                    600: '#807866',  // Акцентные элементы
                    700: '#645c4d',  // Текст
                    800: '#484237',  // Темный текст
                    900: '#2c2820',  // Акцентный темный
                    950: '#181610',  // Почти черный с теплым оттенком
                },

                // ДОПОЛНИТЕЛЬНО: акцентные цвета (по желанию)
                accent: {
                    gold: '#d4af37',     // Золотой для важных элементов
                    terracotta: '#cc7357', // Терракота для кнопок действий
                    olive: '#6b7d47',     // Оливковый для природных акцентов
                },


                // УСПЕХ / РОСТ — зелёный, для позитивных действий и метрик
                success: '#10b981',

                // ВНИМАНИЕ / ПРЕДУПРЕЖДЕНИЕ — жёлтый, для предупреждений и уведомлений
                warning: '#f59e0b',

                // ОШИБКА / УГРОЗА — красный, для ошибок и критических состояний
                error: '#ef4444',   // Красный для кнопок "Отклонить", "Ошибка"

                // ИНФОРМАЦИЯ — синий, для информационных сообщений и элементов
                info: '#3b82f6',
            },

            // Кастомные размеры
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '92': '23rem',
                '128': '32rem',
                '144': '36rem',
            },

            // Кастомные тени
            boxShadow: {
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
                'none': 'none',
                'card': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            },

            // Border radius
            borderRadius: {
                'none': '0px',
                'sm': '0.125rem',
                'DEFAULT': '0.25rem',
                'md': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                'full': '9999px',
                'card': '0.75rem',
                'button': '0.5rem',
            },

            // Типографика
            fontSize: {
                'xs': ['0.75rem', {lineHeight: '1rem'}],
                'sm': ['0.875rem', {lineHeight: '1.25rem'}],
                'base': ['1rem', {lineHeight: '1.5rem'}],
                'lg': ['1.125rem', {lineHeight: '1.75rem'}],
                'xl': ['1.25rem', {lineHeight: '1.75rem'}],
                '2xl': ['1.5rem', {lineHeight: '2rem'}],
                '3xl': ['1.875rem', {lineHeight: '2.25rem'}],
                '4xl': ['2.25rem', {lineHeight: '2.5rem'}],
                '5xl': ['3rem', {lineHeight: '1'}],
                '6xl': ['3.75rem', {lineHeight: '1'}],
                '7xl': ['4.5rem', {lineHeight: '1'}],
                '8xl': ['6rem', {lineHeight: '1'}],
                '9xl': ['8rem', {lineHeight: '1'}],
            },
        },
    },

    plugins: [
        plugin(function ({addUtilities, addComponents}) {
            addComponents({
                '.shadow-icon': {
                    outline: 'none',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '0.25rem',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 1px 2px 2px rgba(181, 176, 162, 0.6)',
                    transition: 'box-shadow 0.4s ease-in-out',
                    color: '#211f19',
                    '&:hover': {
                        boxShadow: '0 0 8px 4px rgba(181, 176, 162, 0.6)',
                    }
                }
            })
            addUtilities({

                '.flex-center-between': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                },
                '.flex-center-center': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            })
        }),
    ],


    // // Отключение предварительного просмотра
    // future: {
    //     hoverOnlyWhenSupported: true,
    // },
    // Темная тема
    darkMode: 'class',
}