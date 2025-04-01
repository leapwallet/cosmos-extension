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
      const allEntries = await AddressBook.getAllEntries()
      if (cancel) return

      const contactsToShow = Object.entries(allEntries)
        .filter(([, contact]) => {
          if (contact.blockchain !== 'injective') return true
          if (contact.blockchain === 'injective' && contact.ethAddress === '') return true
          return false
        })
        .reduce((acc: AddressBook.SavedAddresses, [key, contact]) => {
          acc[key] = contact
          return acc
        }, {})

      setContacts(contactsToShow)
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
