import { Images } from 'images'
import { useEffect, useState } from 'react'

export const useSiteLogo = (siteOrigin: string | undefined) => {
  const [logoURL, setLogoURL] = useState(Images.Misc.Globe)

  useEffect(() => {
    if (!siteOrigin) return
    // Fetch the root HTML document
    fetch(siteOrigin)
      .then((response) => response.text())
      .then((html) => {
        // Create a temporary div to parse the HTML content
        const tempDiv = document.createElement('div')
        // create shadow dom
        const shadow = tempDiv.attachShadow({ mode: 'closed' })
        // Set the HTML content
        shadow.innerHTML = html

        // Find the favicon link in the document head
        const iconLinkElement: HTMLLinkElement | null =
          shadow.querySelector("link[rel='icon']") ??
          shadow.querySelector("link[rel='shortcut icon']")

        if (iconLinkElement) {
          // replace origin
          const link = new URL(new URL(iconLinkElement.href).pathname, siteOrigin)
          setLogoURL(link.toString())
        }
      })
      .catch()
  }, [siteOrigin])

  return logoURL
}
