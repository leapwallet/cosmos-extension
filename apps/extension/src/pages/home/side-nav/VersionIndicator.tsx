import React, { useCallback, useEffect, useState } from 'react'
import { UserClipboard } from 'utils/clipboard'
import browser from 'webextension-polyfill'

export default function VersionIndicator() {
  const [version, setVersion] = useState('Version X.X.X')

  const handleCopyVersion = useCallback(() => {
    UserClipboard.copyText(version)
  }, [version])

  useEffect(() => {
    const version = browser.runtime.getManifest().version
    setVersion(version)
  }, [])

  return (
    <span className='block text-center text-muted-foreground py-7' onClick={handleCopyVersion}>
      {version}
    </span>
  )
}
