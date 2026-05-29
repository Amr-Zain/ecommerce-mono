import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@ecommerce/ui/components/button'
import { useTranslation } from 'react-i18next'
import { ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/unauthorized')({
    component: Unauthorized,
})

function Unauthorized() {
    const { t } = useTranslation()

    return (
        <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-6">
                <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{t('common.unauthorized')}</h1>
            <p className="text-lg text-muted-foreground">
                {t('messages.unauthorized_access')}
            </p>
            <div className="mt-4 flex gap-4">
                <Button variant="default">
                    <Link to="/" replace>{t('common.back_to_home')}</Link>
                </Button>
            </div>
        </div>
    )
}
