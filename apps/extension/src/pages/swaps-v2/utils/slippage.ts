type SlippageRemarks =
  | {
      type: 'error' | 'warn'
      color: 'orange' | 'red'
      message: string
    }
  | undefined

function getSlippageRemarks(slippage: string | undefined): SlippageRemarks {
  if (!slippage) {
    return undefined
  }

  const parsedSlippage = parseFloat(slippage)

  if (isNaN(parsedSlippage)) {
    return { type: 'error', color: 'red', message: 'Please enter a valid number.' }
  }

  if (parsedSlippage > 99 || parsedSlippage < 0) {
    return { type: 'error', color: 'red', message: 'Slippage must be between 0 and 99.' }
  }

  if (parsedSlippage > 10) {
    return {
      type: 'warn',
      color: 'red',
      message: 'Extremely high slippage: The recommended slippage is between 0.1% to 3%',
    }
  }

  if (parsedSlippage > 3) {
    return {
      type: 'warn',
      color: 'orange',
      message:
        'High slippage can result in an unfavourable trade if the price shifts significantly when the transaction is executed.',
    }
  }

  if (parsedSlippage < 0.1) {
    return {
      type: 'warn',
      color: 'orange',
      message: 'Very low slippage. Your transaction may fail!',
    }
  }
}

export { getSlippageRemarks, SlippageRemarks }
