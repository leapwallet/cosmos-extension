import { useEffect, useState } from 'react'
import { AddressBook } from 'utils/addressbook'

export const useContacts = () => {
  const [contacts, setContacts] = useState<AddressBook.SavedAddresses>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false

    AddressBook.subscribe(setContacts)

    const fn = async () => {
      const s = await AddressBook.getAllEntries()
      if (cancel) return
      setContacts(s)
      setLoading(false)
    }

    fn()

    return () => {
      AddressBook.unsubscribe(setContacts)
      cancel = true
    }
  }, [])

  return { contacts, loading }
}

export const useContactsSearch = (searchQuery?: string): AddressBook.SavedAddress[] => {
  const { contacts, loading } = useContacts()

  const search = (searchQuery?: string) => {
    if (loading) {
      return []
    }
    const cleanSearchQuery = searchQuery?.trim().toLowerCase() ?? ''
    if (cleanSearchQuery.length === 0) {
      return Object.values(contacts)
    }
    const searchResults = Object.values(contacts).filter((contact) => {
      return contact.name.toLowerCase().includes(cleanSearchQuery)
    })
    return searchResults
  }

  return search(searchQuery)
}
