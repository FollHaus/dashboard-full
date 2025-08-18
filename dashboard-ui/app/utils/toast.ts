export const toast = {
  success: (msg: string) => {
    if (typeof window !== 'undefined') {
      window.alert(msg)
    }
  },
  error: (msg: string) => {
    if (typeof window !== 'undefined') {
      window.alert(msg)
    }
  },
}
