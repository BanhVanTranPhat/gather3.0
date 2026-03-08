import Realm from './models/Realm'
import Profile from './models/Profile'

export async function getRealmById(id: string) {
  if (!id) return null
  const realm = await Realm.findOne({ $or: [{ _id: id }, { id }] }).lean()
  if (!realm) return null
  return {
    id: (realm as any).id || (realm as any)._id?.toString(),
    owner_id: realm.owner_id,
    name: realm.name,
    map_data: realm.map_data,
    share_id: realm.share_id,
    only_owner: realm.only_owner,
  }
}

export async function getProfileById(id: string) {
  const profile = await Profile.findOne({ id }).lean()
  return profile ? { id: profile.id, skin: profile.skin, visited_realms: profile.visited_realms || [] } : null
}
