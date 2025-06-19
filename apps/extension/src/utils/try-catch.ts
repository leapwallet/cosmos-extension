export const tryCatch = async <TResponse, TError = Error>(
  promise: Promise<TResponse>,
): Promise<[TResponse, null] | [null, TError]> => {
  try {
    const res = await promise
    return [res, null]
  } catch (error) {
    return [null, error as TError]
  }
}

export const tryCatchSync = <TResponse, TError = Error>(
  res: () => TResponse,
): [TResponse, null] | [null, TError] => {
  try {
    return [res(), null]
  } catch (error) {
    return [null, error as TError]
  }
}
