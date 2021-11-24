import localforage from "localforage"
import Storage from "../../modules/storage/storage"
import { Interact } from "../../store/interact"
import { Lang } from "../../store/lang"
import { wait } from "../../utils/tick/tick"

type selectNewStorageProps = {
  current: 'local' | 'pouchdb' | string,
  onSelect: Function
}

export const useStorageSelectMenu = async (props: selectNewStorageProps) => {
  let buttons = [
    {
      title: `${props.current === 'local' ? '✓' : ''} ${Lang.t(
        'storage.local_title',
        'This Device Only',
      )}`,
      description: Lang.t(
        'storage.local_description',
        'Good for getting started, but make sure you backup your data.',
      ),
      click() {
        props.onSelect('local')
      },
    },
    {
      title: `${props.current === 'pouchdb' ? '✓' : ''} ${Lang.t(
        'storage.pouchdb_title',
        'CouchDB (beta)',
      )}`,
      description: `${Lang.t(
        'storage.pouchdb_description',
        'Sync your data in real time to a remote CouchDB server. ⚠️ Not good for multiple devices.',
      )}`,
      click() {
        props.onSelect('pouchdb')
      },
    },
    {
      title: `${props.current === 'blockstack' ? '✓' : ''
        } ⚠️⚠️⚠️ Blockstack`,
      description: `⚠️ NO LONGER SUPPORTED / SHUTTING DOWN, please use Device Only or CouchDB instead.`,
      click() {
        alert("This method is no longer available");
      },
    },
  ]
  Interact.popmenu({
    title: `${Lang.t('storage.type_selector_title', 'Storage Options')}`,
    description: `${Lang.t(
      'storage.type_selector_title',
      'How would you like your data stored?',
    )}`,
    buttons: buttons,
  })
}


/**
 * A Confirmed function to delete all data from nomie 
 */
export const deleteEverything = async () => {
  try {
    let res = await Interact.confirm(
      `${Lang.t('settings.danger-zone')}`,
      `${Lang.t(
        'settings.delete-warning',
        'This will destroy ALL data in Nomie. Are you absolutely sure?',
      )}`,
      `${Lang.t('settings.destroy', 'Destroy')}`,
    )
    if (res) {
      await wait(200)
      res = await Interact.confirm(
        `${Lang.t('settings.danger-zone')}`,
        `${Lang.t(
          'settings.delete-warning-again',
          'So you REALLY want all ALL data in Nomie destroyed?',
        )}`,
        `${Lang.t('settings.destroy', 'Destroy')}`,
      )

      if (res === true) {
        Interact.blocker(
          `${Lang.t('settings.deleting-data', 'Deleting data...')}`,
        )
        let files = await Storage.list()

        let promises = []
        files.forEach((file) => {
          promises.push(Storage.delete(file))
        })
        await Promise.all(promises)
        await localforage.clear()
        localStorage.clear()
        Interact.stopBlocker()
        await Interact.alert('Done', 'Your data has been destroyed.')

        window.location.href = '/'
      }
    } // end if confirmed
  } catch (e) {
    Interact.alert(Lang.t('general.error'), e.message)
  }
}