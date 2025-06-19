import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'

export const SidePanelNavigation = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSidePanel()) {
      closeSidePanel(false)
    }
  }, [])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request?.type) {
        case 'side-panel-status': {
          if (isSidePanel()) {
            try {
              sendResponse({
                type: request.type,
                message: {
                  enabled: true,
                },
              })
            } catch (error) {
              sendResponse({
                type: request.type,
                message: {
                  enabled: false,
                },
              })
            }
          } else {
            sendResponse({
              type: request.type,
              message: {
                enabled: false,
              },
            })
          }
          break
        }
        case 'side-panel-update': {
          if (isSidePanel()) {
            chrome.windows.getCurrent((window) => {
              if (window && window.id && chrome.sidePanel) {
                chrome.sidePanel.open({
                  windowId: window.id,
                })
              }
            })
            navigate(request?.message?.url)
            sendResponse({
              type: request.type,
              message: {
                success: true,
              },
            })
          }
          break
        }
        default: {
          break
        }
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
