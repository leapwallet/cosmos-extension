import React, { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

export default function VersionIndicator() {
  const [version, setVersion] = useState('Version X.X.X')

  useEffect(() => {
    const version = browser.runtime.getManifest().version
    setVersion(version)
  }, [])

  return <span className='block text-center text-muted-foreground py-7'>{version}</span>
}
