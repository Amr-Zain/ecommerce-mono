import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TabsList, TabsTrigger } from '@ecommerce/ui/components/tabs'
import { AnimatePresence, motion } from 'motion/react'
import ProfileCard from './ProfileCard'
import EditProfileForm from './EditProfile'
import ChangePasswordForm from './ChangePassword'
import ProfileSettings from './ProfileSettings'
import ProfileSessions from './Sessions'
import type { TabItem } from '@/components/ui/AnimatedTabs'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'
import { useDashboardProfile } from '@/hooks/useDashboardProfile'
import { AnimatedTabs } from '@/components/ui/AnimatedTabs'

export default function Profile() {
  const { t } = useTranslation()
  const { data: profile } = useDashboardProfile()

  const initialValues = useMemo(
    () => ({
      full_name: profile?.name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone || '',
      phone_code: profile?.phone_code || '',
      image: profile?.image?.url || profile?.image?.path || '',
    }),
    [
      profile?.email,
      profile?.image?.path,
      profile?.image?.url,
      profile?.name,
      profile?.phone,
      profile?.phone_code,
    ],
  )

  if (!profile) return null

  const items: Array<TabItem> = [
    { value: 'edit-profile', label: t('tabs.editProfile') },
    { value: 'change-password', label: t('tabs.changePassword') },
    { value: 'settings', label: t('tabs.settings') },
    { value: 'sessions', label: t('tabs.sessions') },
  ]

  return (
    <>
      <SmartBreadcrumbs entityKey="menu.profile" />
      <div className="@container w-full">
        <AnimatedTabs
          defaultValue="edit-profile"
          items={items}
          renderTabsList={(itemsList, activeValue, onChange) => (
            <>
              <TabsList className="hidden @[750px]:flex w-fit bg-muted/50 border h-11 p-1 rounded-xl mb-4">
                {itemsList.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="whitespace-nowrap cursor-pointer"
                    onClick={() => onChange(item.value)}
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="grid grid-cols-1 @[750px]:grid-cols-[350px_1fr] gap-4">
                <ProfileCard />
                <div className="min-h-[80vh]">
                  <TabsList className="flex @[750px]:hidden w-full bg-muted/50 border h-11 p-1 rounded-xl mb-4">
                    {itemsList.map((item) => (
                      <TabsTrigger
                        key={item.value}
                        value={item.value}
                        className="whitespace-nowrap"
                        onClick={() => onChange(item.value)}
                      >
                        {item.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <AnimatePresence mode="wait">
                    {activeValue === 'edit-profile' && (
                      <motion.div
                        key="edit-profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EditProfileForm initialValues={initialValues} />
                      </motion.div>
                    )}
                    {activeValue === 'change-password' && (
                      <motion.div
                        key="change-password"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChangePasswordForm />
                      </motion.div>
                    )}
                    {activeValue === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProfileSettings />
                      </motion.div>
                    )}
                    {activeValue === 'sessions' && (
                      <motion.div
                        key="sessions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProfileSessions />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        />
      </div>
    </>
  )
}
