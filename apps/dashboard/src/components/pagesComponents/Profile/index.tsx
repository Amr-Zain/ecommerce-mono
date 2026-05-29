import { useTranslation } from 'react-i18next'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ecommerce/ui/components/tabs'
import ProfileCard from './ProfileCard'
import EditProfileForm from './EditProfile'
import ChangePasswordForm from './ChangePassword'
import { useAuthStore } from '@/stores/authStore'
import { ContactRound, Home } from 'lucide-react'
import ProfileSettings from './ProfileSettings'
import { SmartBreadcrumbs } from '@/components/layout/SmartBreadcrumbs'

export default function Profile() {
  const { t } = useTranslation()
  const profile = useAuthStore((state) => state.user)!

  const initialValues = {
    full_name: profile?.name,
    email: profile?.email,
    phone: profile?.phone || '',
    phone_code: profile?.phone_code || '',
    image: profile?.image?.url || '',
  }

  return (
    <>
      <SmartBreadcrumbs entityKey='menu.profile' />
      <div className="@container w-full">
        <Tabs defaultValue="edit-profile" className="w-full">
          <TabsList className="hidden @[750px]:flex w-fit bg-muted/50 border h-11 p-1 rounded-xl mb-4">
            <TabsTrigger
              value="edit-profile"
              className="whitespace-nowrap cursor-pointer"
            >
              {t('tabs.editProfile')}
            </TabsTrigger>
            <TabsTrigger value="change-password" className="whitespace-nowrap">
              {t('tabs.changePassword')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="whitespace-nowrap">
              {t('tabs.settings')}
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 @[750px]:grid-cols-[350px_1fr] gap-4 ">
            <ProfileCard />
            <div className="min-h-[80vh]">
              <TabsList className="flex @[750px]:hidden w-full bg-muted/50 border h-11 p-1 rounded-xl mb-4">
                <TabsTrigger
                  value="edit-profile"
                  className="whitespace-nowrap cursor-pointer"
                >
                  {t('tabs.editProfile')}
                </TabsTrigger>
                <TabsTrigger
                  value="change-password"
                  className="whitespace-nowrap"
                >
                  {t('tabs.changePassword')}
                </TabsTrigger>
                <TabsTrigger value="settings" className="whitespace-nowrap">
                  {t('tabs.settings')}
                </TabsTrigger>
              </TabsList>              <TabsContent value="edit-profile" className="m-0">
                <EditProfileForm initialValues={initialValues} />
              </TabsContent>

              <TabsContent value="change-password" className="m-0">
                <ChangePasswordForm />
              </TabsContent>
              <TabsContent value="settings" className="m-0">
                <ProfileSettings />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </>
  )
}
