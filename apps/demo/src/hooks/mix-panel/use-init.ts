import type { Config } from 'mixpanel-browser'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'

const useInit = (projectToken: string, config?: Partial<Config>) => {
  useEffect(() => {
    mixpanel.init(projectToken, config)
  }, [projectToken, config])
}

export default useInit
