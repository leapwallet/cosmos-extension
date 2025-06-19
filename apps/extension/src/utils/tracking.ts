import mixpanel, { Dict } from 'mixpanel-browser'

import { tryCatchSync } from './try-catch'

export const mixpanelTrack = (event: string, properties?: Dict) => {
  tryCatchSync(() => mixpanel.track(event, properties))
}
