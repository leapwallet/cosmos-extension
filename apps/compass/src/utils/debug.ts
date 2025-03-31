/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
export const DEBUG = (context: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'production') return
  console.log(context, message, data)
}
