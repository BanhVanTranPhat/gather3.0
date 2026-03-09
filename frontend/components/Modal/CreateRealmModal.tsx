'use client'
import React, { useState } from 'react'
import Modal from './Modal'
import { useModal } from '@/app/hooks/useModal'
import BasicButton from '../BasicButton'
import BasicInput from '../BasicInput'
import { createClient } from '@/utils/auth/client'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation' 
import revalidate from '@/utils/revalidate'
import { removeExtraSpaces } from '@/utils/removeExtraSpaces'
import defaultMap from '@/utils/defaultmap.json'
import officeMap from '@/utils/officemap.json'

type MapTemplate = 'starter' | 'office' | 'scratch'

const MAP_TEMPLATES: { value: MapTemplate; label: string; description: string }[] = [
    { value: 'starter', label: 'Starter Map', description: 'Outdoor park with trees & paths' },
    { value: 'office', label: 'Office Map', description: '3 offices + lounge room' },
    { value: 'scratch', label: 'Blank', description: 'Empty map, build from zero' },
]

const CreateRealmModal:React.FC = () => {
    
    const { modal, setModal } = useModal()
    const [realmName, setRealmName] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [template, setTemplate] = useState<MapTemplate>('office')

    const router = useRouter()

    async function createRealm() {
        const auth = createClient()
        const { data: { user } } = await auth.auth.getUser()

        if (!user) {
            return
        }

        const uid = user.id

        setLoading(true)

        const realmData: any = {
            owner_id: uid,
            name: realmName,
        }
        if (template === 'starter') {
            realmData.map_data = defaultMap
        } else if (template === 'office') {
            realmData.map_data = officeMap
        }

        const { data, error } = await auth.from('realms').insert(realmData).select()

        if (error) {
            toast.error(error?.message)
        } 

        if (data) {
            setRealmName('')
            revalidate('/app')
            setModal('None')
            toast.success('Your space has been created!')
            router.push(`/editor/${data[0].id}`)
        }

        setLoading(false)
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = removeExtraSpaces(e.target.value)
        setRealmName(value)
    }

    return (
        <Modal open={modal === 'Create Realm'} closeOnOutsideClick>
            <div className='flex flex-col p-6 gap-5'>
                <div className='text-center'>
                    <h1 className='text-xl font-semibold'>Create a Space</h1>
                    <p className='text-sm text-gray-400 mt-1'>Choose a template and give it a name</p>
                </div>

                <BasicInput label={'Space Name'} className='w-full' value={realmName} onChange={onChange} maxLength={32}/>

                <div>
                    <p className='text-sm text-gray-400 mb-2'>Map Template</p>
                    <div className='flex flex-col gap-2'>
                        {MAP_TEMPLATES.map((t) => (
                            <label
                                key={t.value}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                                    template === t.value
                                        ? 'border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/20'
                                        : 'border-gray-600/50 hover:border-gray-400 hover:bg-white/5'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="mapTemplate"
                                    value={t.value}
                                    checked={template === t.value}
                                    onChange={() => setTemplate(t.value)}
                                    className='accent-blue-500'
                                />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>{t.label}</p>
                                    <p className='text-xs text-gray-400'>{t.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className='flex gap-3 pt-1'>
                    <button
                        onClick={() => setModal('None')}
                        className='flex-1 py-2.5 rounded-lg border border-gray-600 text-sm font-medium hover:bg-white/5 transition-colors'
                    >
                        Cancel
                    </button>
                    <BasicButton
                        disabled={realmName.length <= 0 || loading}
                        onClick={createRealm}
                        className='flex-1 !py-2.5 text-sm font-medium'
                    >
                        {loading ? 'Creating...' : 'Create Space'}
                    </BasicButton>
                </div>
            </div>
        </Modal>
    )
}

export default CreateRealmModal