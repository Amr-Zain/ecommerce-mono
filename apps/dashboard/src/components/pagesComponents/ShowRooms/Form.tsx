import AppForm from '@/components/common/form/AppForm'
import { useMutate } from '@/hooks/UseMutate'
import { generateFinalOut, generateInitialValues } from '@/util/helpers'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/util/queryKeysFactory'
import { ShowRoomFormData, makeShowRoomSchema } from '@/lib/schema'
import { buildShowRoomFields } from './Config'
import { ShowRoomDetail, } from '@/types/api/showRoom'
import { useForm, useWatch } from 'react-hook-form'
import { zodFormResolver } from '@/lib/schema/resolver'
import { useEffect, useRef, useState } from 'react'

export default function ShowRoomForm({ showRoom }: { showRoom?: ShowRoomDetail }) {
  const { t } = useTranslation()
  const [currentPhoneLimit, setCurrentPhoneLimit] = useState<number | null>(0)
  const [phoneStartingNumber, setPhoneStartingNumber] = useState<number | null>(0)

  const schema = makeShowRoomSchema(t, currentPhoneLimit, phoneStartingNumber)
  const form = useForm<ShowRoomFormData>({
    resolver: zodFormResolver(schema),
    defaultValues: {
      ...generateInitialValues(showRoom),
      country_id: showRoom ? String(showRoom?.country?.id) : '',
      // city: showRoom ? String(showRoom?.city?.id) : '',
      map: {
        lat: showRoom?.lat!,
        lng: showRoom?.lng!,
      },
    },
    mode: 'onChange',
  })
  const countryId = useWatch({
    control: form.control,
    name: 'country_id',
  })
  const prevCountryId = useRef<string | undefined>(form.getValues('country_id'))

  const fields = buildShowRoomFields(
    t,
    setCurrentPhoneLimit,
    setPhoneStartingNumber,
    countryId,
  )

  useEffect(() => {
    if (prevCountryId.current === undefined) {
      prevCountryId.current = countryId
      return
    }

    if (prevCountryId.current === countryId) return

    // form.setValue('city_id', '')
    prevCountryId.current = countryId
  }, [countryId, form])

  const { mutate, isPending } = useMutate({
    endpoint: showRoom ? `show-rooms/${showRoom.id}` : 'show-rooms',
    mutationKey: queryKeys.showRooms.getShowRoom(String(showRoom?.id ?? 'new')),
    invalidates: [
      queryKeys.showRooms.all(),
      queryKeys.showRooms.getShowRoom(String(showRoom?.id ?? 'new')),
    ],
    method: 'post',
    redirectTo: '/show-rooms',
  })

  const handleSubmit = (v: ShowRoomFormData) => {
    mutate({ ...generateFinalOut(showRoom, v), lat: v.map.lat, lng: v.map.lng, _method: showRoom?.id ? 'patch' : 'post' })
  }

  return (
    <AppForm<ShowRoomFormData>
      schema={schema as any}
      fields={fields}
      providedForm={form as any}
      onSubmit={handleSubmit}
      isLoading={isPending}
      gridColumns={2}
      spacing="md"
      className="bg-card border border-border rounded-lg shadow-sm"
      formClassName="p-6"
      submitButtonText={
        showRoom
          ? t('actions.update', { entity: t('menu.showRooms') })
          : t('actions.create', { entity: t('menu.showRooms') })
      }
    />
  )
}
