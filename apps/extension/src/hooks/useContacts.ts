import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'
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

  const searchResult = useMemo(() => {
    if (loading) {
      return []
    }
    const contactsList = Object.values(contacts)
    const cleanSearchQuery = searchQuery?.trim().toLowerCase() ?? ''
    if (cleanSearchQuery.length === 0) {
      return contactsList
    }
    return new Fuse(contactsList, {
      threshold: 0.3,
      keys: ['name', 'address', 'ethAddress'],
    })
      .search(cleanSearchQuery)
      .map((contact) => contact.item)
  }, [contacts, loading, searchQuery])

  return searchResult
}
