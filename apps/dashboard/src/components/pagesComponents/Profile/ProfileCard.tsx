import { Card, CardContent, CardHeader, CardTitle } from '@ecommerce/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@ecommerce/ui/components/avatar'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'

export default function ProfileCard() {
  const { t } = useTranslation()
  const user = useAuthStore(
    (state) => state.user!
  )

  const initials = useMemo(() => {
    const name = user?.name?.trim()
    if (!name) return 'A'
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }, [user?.name])

  const personalInfo = [
    { label: t('Form.labels.name'), value: user?.name },
    { label: t('Form.labels.email'), value: user?.email },
    { label: t('Form.labels.phone'), value: user?.phone },
  ]

  return (
    <Card className="rounded-3xl overflow-hidden border-primary/20 max-h-fit">
      <CardHeader className="flex items-center gap-4 pb-0">
        <Avatar className="w-20 h-20 ring-1 ring-primary/20">
          <AvatarImage src={user?.image?.url ?? ''} alt={user?.name ?? 'Profile'} />
          <AvatarFallback className="bg-gradient-primary text-white text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-2xl">{user?.name}</CardTitle>
          <span className="text-sm text-muted-foreground text-center">
            {user?.email}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('text.personal_info')}
        </h3>
        <div className="space-y-3">
          {personalInfo.map(
            (row) =>
              row.value && (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="w-32 text-sm font-medium text-muted-foreground">
                    {row.label}
                  </span>
                  {row.value ? (
                    <span className="text-sm">: {row.value}</span>
                  ) : null}
                </div>
              ),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
