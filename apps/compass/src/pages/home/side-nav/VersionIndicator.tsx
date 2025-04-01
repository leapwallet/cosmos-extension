import Text from 'components/text'
import React, { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

export default function VersionIndicator() {
  const [version, setVersion] = useState('Version X.X.X')

  useEffect(() => {
    const version = browser.runtime.getManifest().version
    setVersion('Version ' + version)
  }, [])

  return (
    <Text size='sm' color='text-center text-gray-400 font-bold'>
      {version}
    </Text>
  )
}
