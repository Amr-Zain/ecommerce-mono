import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@ecommerce/ui/components/card'
import { Badge } from '@ecommerce/ui/components/badge'
import { Separator } from '@ecommerce/ui/components/separator'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/util/helpers'
import { UserShow } from '../Config'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@ecommerce/ui/components/avatar'
import { ShieldAlert } from 'lucide-react'
import ButtonCopy from '@ecommerce/ui/components/copy-button'

type Props = {
  user: UserShow
}

export function UserHeaderCard({ user }: Props) {
  const { t } = useTranslation()
  const imageUrl = typeof user.image === 'string' ? user.image : user.image?.url
  const displayName =
    user.full_name || user.email || user.phone || t('common.guest')
  const avatarFallback = displayName.substring(0, 2).toUpperCase()

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border ring-1 ring-border">
            <AvatarImage src={imageUrl || ''} />
            <AvatarFallback className="text-xl uppercase bg-primary/10 text-primary">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {displayName}
              <Separator orientation="vertical" className="h-6" />
              <Badge variant="outline" className="font-normal">
                {user.user_type === 'client'
                  ? t('common.client')
                  : user.user_type === 'guest'
                    ? t('common.guest')
                    : t('common.super_admin')}
              </Badge>
            </CardTitle>

            <CardDescription className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span>
                {t('table.columns.code')} #{user.id}
              </span>
              <span>•</span>
              <span>
                {t('table.createdAt')} {formatDate(user.created_at)}
              </span>
              {user.last_login_at && (
                <>
                  <span>•</span>
                  <span>
                    {t('userShow.last_login')} {formatDate(user.last_login_at)}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Badge variant={user.is_active ? 'default' : 'secondary'}>
              {user.is_active ? t('status.active') : t('status.inactive')}
            </Badge>
            {user.is_ban && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {t('status.banned')}
              </Badge>
            )}
            {user.tier?.name && (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                {user.tier.name}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {user.email || user.phone || t('common.noContact')}
          </span>
          {user.shopify_id && (
            <div className="flex items-center gap-1">
              <div className="text-sm font-medium">
                {t('userShow.shopify_id')}: {user.shopify_id || 'unregistered'}
              </div>
              <ButtonCopy content={user.shopify_id || ''} className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}
