import Text from 'components/text'
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
    setVersion('Version ' + version)
  }, [])

  return (
    <Text size='sm' color='text-center text-gray-400 font-bold' onClick={handleCopyVersion}>
      {version}
    </Text>
  )
}
